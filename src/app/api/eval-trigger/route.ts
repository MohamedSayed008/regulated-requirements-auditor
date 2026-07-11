import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { runEvals } from '@/lib/eval-engine';
import { runAudit } from '@/lib/audit-engine';
import einvSnapshot from '@/data/corpus/einvoicing/snapshot.json';

// Temporary, token-guarded trigger. `inspect: true` returns the raw eInvoicing
// sample audit findings so the ground truth can be tightened; otherwise it runs
// the full per-corpus eval suite. Removed once reports.json is committed.

export const maxDuration = 300;

export async function POST(req: NextRequest): Promise<Response> {
  const token = process.env.AUDIT_TOKEN;
  if (!token || req.headers.get('x-audit-token') !== token) {
    return new Response(JSON.stringify({ error: 'forbidden' }), {
      status: 403,
      headers: { 'content-type': 'application/json' },
    });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'not_configured' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }

  const body = await req.json().catch(() => ({}));
  if (body?.inspect) {
    const run = await runAudit(
      new Anthropic(),
      einvSnapshot as { path: string; content: string }[],
      'sample-app-einvoicing',
      'uae-einvoicing'
    );
    const brief = run.findings.map(f => ({
      requirementId: f.requirementId,
      filePath: f.filePath,
      severity: f.severity,
      summary: f.summary,
    }));
    return new Response(JSON.stringify({ findings: brief }, null, 2), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  const reports = await runEvals();
  return new Response(JSON.stringify(reports, null, 2), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
