import { z } from 'zod';

/**
 * A Finding is the output of auditing code against a requirement unit. The
 * shape is designed as if persistence exists (v1 keeps findings ephemeral):
 * status moves proposed -> approved/rejected, always through a human.
 */

export const SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;
export type Severity = (typeof SEVERITIES)[number];

export const FINDING_STATUSES = ['proposed', 'approved', 'rejected'] as const;
export type FindingStatus = (typeof FINDING_STATUSES)[number];

/** What the auditing agent emits, before any human review. */
export const proposedFindingSchema = z.object({
  requirementId: z.string(),
  severity: z.enum(SEVERITIES),
  filePath: z.string(),
  lineStart: z.number().int().positive(),
  lineEnd: z.number().int().positive(),
  codeExcerpt: z.string().min(1),
  summary: z.string().min(1),
  evidence: z.string().min(1),
  recommendedAction: z.string().min(1),
});

export type ProposedFinding = z.infer<typeof proposedFindingSchema>;

/** Arabic prose overlay for a cached run's findings, keyed by finding id. */
export interface FindingProseAr {
  summary: string;
  evidence: string;
  recommendedAction: string;
}

/**
 * Replaces a finding's prose fields from a hand-translated overlay when the
 * locale is Arabic. Ids, paths, lines, and code excerpts stay untouched, so
 * citations and exports keep working.
 */
export function applyProseOverlay<T extends { id: string }>(
  findings: (T & { summary: string; evidence: string; recommendedAction: string })[],
  overlay: Record<string, FindingProseAr>
): (T & { summary: string; evidence: string; recommendedAction: string })[] {
  return findings.map(finding => {
    const prose = overlay[finding.id];
    return prose ? { ...finding, ...prose } : finding;
  });
}

/** The persisted/reviewable finding: a proposed finding plus an id and status. */
export const findingSchema = proposedFindingSchema.extend({
  id: z.string(),
  status: z.enum(FINDING_STATUSES),
  reviewerNote: z.string().optional(),
});

export type Finding = z.infer<typeof findingSchema>;

/** The full cached audit run the public demo replays. */
export const auditRunSchema = z.object({
  ranAt: z.string(),
  model: z.string(),
  target: z.string(),
  requirementsChecked: z.number().int().nonnegative(),
  filesScanned: z.array(z.string()),
  findings: z.array(findingSchema),
  usage: z.object({
    inputTokens: z.number().int().nonnegative(),
    outputTokens: z.number().int().nonnegative(),
    estimatedCostUsd: z.number().nonnegative(),
  }),
});

export type AuditRun = z.infer<typeof auditRunSchema>;

/** JSON Schema handed to the model's structured-output tool. */
export const findingToolInputSchema = {
  type: 'object' as const,
  additionalProperties: false,
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          requirementId: { type: 'string' },
          severity: { type: 'string', enum: [...SEVERITIES] },
          filePath: { type: 'string' },
          lineStart: { type: 'integer' },
          lineEnd: { type: 'integer' },
          codeExcerpt: { type: 'string' },
          summary: { type: 'string' },
          evidence: { type: 'string' },
          recommendedAction: { type: 'string' },
        },
        required: [
          'requirementId',
          'severity',
          'filePath',
          'lineStart',
          'lineEnd',
          'codeExcerpt',
          'summary',
          'evidence',
          'recommendedAction',
        ],
      },
    },
  },
  required: ['findings'],
};
