import { describe, expect, it } from 'vitest';
import { evalReportSetSchema } from '@/lib/eval-report';
import reportsJson from '@/data/evals/reports.json';

/**
 * The eval-regression gate: the literal enforcement of "no eval report, no
 * release". CI runs this suite, so a commit that publishes worse eval numbers
 * than the floors below fails the build. Raising a floor is a deliberate,
 * reviewed edit to this file; lowering one should hurt.
 */

const FLOORS: Record<string, { precision: number; recall: number }> = {
  'dubai-tenancy': { precision: 1.0, recall: 1.0 },
  'uae-einvoicing': { precision: 0.85, recall: 1.0 },
};

const reports = evalReportSetSchema.parse(reportsJson);

describe('eval regression gate', () => {
  it('has a published report for every gated corpus', () => {
    const ids = reports.map(r => r.corpusId);
    for (const corpusId of Object.keys(FLOORS)) {
      expect(ids, `missing eval report for ${corpusId}`).toContain(corpusId);
    }
  });

  for (const entry of reports) {
    const floor = FLOORS[entry.corpusId];

    describe(entry.corpusName, () => {
      it('is covered by an explicit floor', () => {
        expect(floor, `add a floor for new corpus ${entry.corpusId}`).toBeDefined();
      });

      it('meets the audit precision floor', () => {
        expect(entry.report.auditScore.precision).toBeGreaterThanOrEqual(floor?.precision ?? 1);
      });

      it('meets the audit recall floor', () => {
        expect(entry.report.auditScore.recall).toBeGreaterThanOrEqual(floor?.recall ?? 1);
      });

      it('passes every eval case in every suite', () => {
        for (const suite of entry.report.suites) {
          expect(suite.passed, `${suite.name}: ${suite.passed}/${suite.total} passed`).toBe(
            suite.total
          );
        }
      });

      it('detected every seeded violation', () => {
        expect(entry.report.auditScore.detectedViolations).toBe(
          entry.report.auditScore.seededViolations
        );
      });
    });
  }
});
