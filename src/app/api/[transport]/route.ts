import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { CORPUS_LIST } from '@/lib/corpora';
import { searchRequirements } from '@/lib/requirement-search';
import { requirementById } from '@/lib/requirement-lookup';
import { fetchRepoFiles } from '@/lib/repo-fetch';
import { runAudit } from '@/lib/audit-engine';
import { applyReviewDecision } from '@/lib/review-actions';
import { passwordMatches } from '@/lib/session';
import { fromMicros, getStore, logEvent, toMicros } from '@/lib/store';
import { checkAskRateLimit } from '@/lib/rate-limit';
import { READINESS_MAX_BODY_BYTES, isDemoDisabled } from '@/lib/guard';
import { runReadiness } from '@/lib/readiness';

export const maxDuration = 120;

/**
 * Mizan as an MCP server: the same governed capabilities the site exposes,
 * usable by any MCP client (Claude Code, Cursor, agents). Reads are public,
 * mirroring the site. The audit tool spends model tokens, so it shares the
 * demo kill switch and a rate limit. The decision tool is the privileged
 * write: it requires the reviewer password as an explicit argument (a
 * deliberate single-operator design; swap for OAuth when there are real user
 * accounts) and goes through the same governed path as the UI, so the
 * append-only audit log records it identically.
 */

function text(value: unknown) {
  return {
    content: [
      {
        type: 'text' as const,
        text: typeof value === 'string' ? value : JSON.stringify(value, null, 2),
      },
    ],
  };
}

const handler = createMcpHandler(
  server => {
    server.registerTool(
      'search_requirements',
      {
        title: 'Search requirements',
        description:
          'Keyword search over the regulation corpora (Dubai tenancy law, UAE eInvoicing mandate). Returns matching requirement units with their citable ids.',
        inputSchema: {
          query: z.string().min(2).max(200),
          corpusId: z.enum(['dubai-tenancy', 'uae-einvoicing']).optional(),
        },
      },
      async ({ query, corpusId }) => {
        const matches = searchRequirements(query, corpusId);
        return text(
          matches.map(m => ({
            id: m.unit.id,
            articleRef: m.unit.articleRef,
            testable: m.unit.testable,
            excerpt: m.unit.textEn.slice(0, 240),
          }))
        );
      }
    );

    server.registerTool(
      'get_requirement',
      {
        title: 'Get requirement',
        description:
          'Fetch one requirement unit by its citable id (e.g. LAW26-2007/ART-25/2), with the full English and Arabic text.',
        inputSchema: { unitId: z.string().min(3).max(60) },
      },
      async ({ unitId }) => {
        const unit = requirementById(unitId);
        if (!unit) return text({ error: 'not_found', unitId });
        return text({
          id: unit.id,
          articleRef: unit.articleRef,
          source: unit.source,
          testable: unit.testable,
          tags: unit.tags,
          textEn: unit.textEn,
          textAr: unit.textAr,
        });
      }
    );

    server.registerTool(
      'list_corpora',
      {
        title: 'List corpora',
        description: 'The regulations Mizan can answer about and audit against.',
        inputSchema: {},
      },
      async () =>
        text(
          CORPUS_LIST.map(c => ({
            id: c.id,
            name: c.name,
            units: c.units.length,
            testable: c.units.filter(u => u.testable).length,
            bilingual: c.bilingual,
          }))
        )
    );

    server.registerTool(
      'check_invoice_readiness',
      {
        title: 'Check eInvoicing readiness',
        description:
          'Validate an invoice payload against the UAE eInvoicing mandate. Deterministic field-level checks (no model calls); every result cites the requirement unit it validates. Pass the invoice as a JSON string; process facts are optional.',
        inputSchema: {
          invoiceJson: z.string().min(2).max(READINESS_MAX_BODY_BYTES),
          format: z.enum(['structured', 'pdf', 'image', 'email']).optional(),
          aspAppointed: z.boolean().optional(),
          storageInUae: z.boolean().optional(),
          canIssueCreditNotes: z.boolean().optional(),
        },
      },
      async ({ invoiceJson, format, aspAppointed, storageInUae, canIssueCreditNotes }) => {
        let invoice: unknown;
        try {
          invoice = JSON.parse(invoiceJson);
        } catch {
          return text({ error: 'invalid_json', hint: 'invoiceJson must be a JSON object.' });
        }
        const report = runReadiness(invoice, {
          format,
          aspAppointed,
          storageInUae,
          canIssueCreditNotes,
        });
        logEvent({
          ts: new Date().toISOString(),
          actor: 'public',
          action: 'readiness',
          corpusId: 'uae-einvoicing',
          detail: `readiness (mcp): ${report.summary.pass} pass, ${report.summary.fail} fail, ${report.summary.notAssessed} not assessed (${report.summary.readyPercent}% ready)`,
        });
        return text(report);
      }
    );

    server.registerTool(
      'audit_repo',
      {
        title: 'Audit a public repo',
        description:
          'Fetch a bounded snapshot of a public GitHub repository and audit it against a corpus. Findings cite the requirement they violate. Spends model tokens; rate-limited.',
        inputSchema: {
          repoUrl: z.string().min(10).max(300),
          corpusId: z.enum(['dubai-tenancy', 'uae-einvoicing']).optional(),
        },
      },
      async ({ repoUrl, corpusId }) => {
        if (isDemoDisabled()) return text({ error: 'demo_disabled' });
        if (!process.env.ANTHROPIC_API_KEY) return text({ error: 'not_configured' });
        const rate = await checkAskRateLimit('mcp:audit');
        if (!rate.ok) return text({ error: 'rate_limited' });

        const fetched = await fetchRepoFiles(repoUrl);
        if (!fetched.ok) return text({ error: fetched.error });

        const target = `${fetched.owner}/${fetched.repo}`;
        const run = await runAudit(new Anthropic(), fetched.files, target, corpusId);
        logEvent({
          ts: new Date().toISOString(),
          actor: 'public',
          action: 'audit_repo',
          corpusId,
          detail: `mcp audited ${target}: ${run.findings.length} findings across ${run.filesScanned.length} files`,
          costMicros: toMicros(run.usage.estimatedCostUsd),
          inputTokens: run.usage.inputTokens,
          outputTokens: run.usage.outputTokens,
        });
        return text({
          target,
          findings: run.findings,
          requirementsChecked: run.requirementsChecked,
          costUsd: run.usage.estimatedCostUsd,
          note: 'Findings are proposed, never final: route them through decide_finding or the review queue.',
        });
      }
    );

    server.registerTool(
      'list_decisions',
      {
        title: 'List review decisions',
        description: 'The durable human decisions for an audited target (the decision trail).',
        inputSchema: { runTarget: z.string().min(1).max(120).default('sample-app') },
      },
      async ({ runTarget }) => text(await getStore().listDecisions(runTarget))
    );

    server.registerTool(
      'get_activity',
      {
        title: 'Get activity totals',
        description:
          'Usage totals from the audit log: questions asked, repos audited, decisions recorded, and model spend.',
        inputSchema: {},
      },
      async () => {
        const totals = await getStore().getTotals();
        return text({ ...totals, costUsd: fromMicros(totals.costMicros) });
      }
    );

    server.registerTool(
      'decide_finding',
      {
        title: 'Decide a finding (reviewer only)',
        description:
          'Approve, reject, or reset a finding as the human reviewer. Requires the reviewer password; the decision persists and is recorded in the append-only audit log.',
        inputSchema: {
          reviewerPassword: z.string().min(1).max(200),
          findingId: z.string().min(1).max(40),
          runTarget: z.string().min(1).max(120),
          status: z.enum(['approved', 'rejected', 'proposed']),
          note: z.string().max(500).optional(),
        },
      },
      async ({ reviewerPassword, ...input }) => {
        const rate = await checkAskRateLimit('mcp:decide');
        if (!rate.ok) return text({ error: 'rate_limited' });
        if (!passwordMatches(reviewerPassword, process.env.REVIEWER_PASSWORD)) {
          return text({ error: 'invalid_credentials' });
        }
        return text(await applyReviewDecision(input));
      }
    );
  },
  {
    serverInfo: { name: 'mizan', version: '1.0.0' },
    capabilities: { tools: {} },
  },
  {
    basePath: '/api',
    maxDuration: 120,
    verboseLogs: false,
  }
);

export { handler as GET, handler as POST };
