import { z } from 'zod';

export const caseResultSchema = z.object({
  id: z.string(),
  pass: z.boolean(),
  detail: z.string(),
});

export const suiteResultSchema = z.object({
  name: z.string(),
  passed: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  cases: z.array(caseResultSchema),
});

export const auditScoreSchema = z.object({
  precision: z.number(),
  recall: z.number(),
  truePositives: z.number().int().nonnegative(),
  falsePositives: z.number().int().nonnegative(),
  seededViolations: z.number().int().nonnegative(),
  detectedViolations: z.number().int().nonnegative(),
});

export const evalReportSchema = z.object({
  ranAt: z.string(),
  model: z.string(),
  suites: z.array(suiteResultSchema),
  auditScore: auditScoreSchema,
  usage: z.object({
    inputTokens: z.number().int().nonnegative(),
    outputTokens: z.number().int().nonnegative(),
    estimatedCostUsd: z.number().nonnegative(),
  }),
});

export const corpusReportSchema = z.object({
  corpusId: z.string(),
  corpusName: z.string(),
  report: evalReportSchema,
});

export const evalReportSetSchema = z.array(corpusReportSchema);

export type CaseResult = z.infer<typeof caseResultSchema>;
export type SuiteResult = z.infer<typeof suiteResultSchema>;
export type AuditScore = z.infer<typeof auditScoreSchema>;
export type EvalReport = z.infer<typeof evalReportSchema>;
export type CorpusReport = z.infer<typeof corpusReportSchema>;
