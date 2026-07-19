import { describe, expect, it } from 'vitest';
import { citedRequirementIds, runReadiness } from '@/lib/readiness';
import { GAPPY_SAMPLE, PASSING_SAMPLE } from '@/lib/readiness-samples';
import { requirementById } from '@/lib/requirement-lookup';

const FULL_PROCESS = {
  format: 'structured',
  aspAppointed: true,
  storageInUae: true,
  canIssueCreditNotes: true,
} as const;

function check(report: ReturnType<typeof runReadiness>, id: string) {
  const found = report.checks.find(c => c.id === id);
  if (!found) throw new Error(`missing check ${id}`);
  return found;
}

describe('citations', () => {
  it('every cited requirement id exists in the corpus', () => {
    for (const id of citedRequirementIds()) {
      expect(requirementById(id), id).toBeDefined();
    }
  });
});

describe('passing sample', () => {
  const report = runReadiness(PASSING_SAMPLE, FULL_PROCESS);

  it('passes every check with full process answers', () => {
    expect(report.summary.fail).toBe(0);
    expect(report.summary.notAssessed).toBe(0);
    expect(report.summary.readyPercent).toBe(100);
    expect(report.fixes).toHaveLength(0);
  });

  it('reports not_assessed (never guesses) when process answers are absent', () => {
    const bare = runReadiness(PASSING_SAMPLE);
    expect(bare.summary.fail).toBe(0);
    expect(bare.summary.notAssessed).toBe(4);
    expect(check(bare, 'structured-format').status).toBe('not_assessed');
    expect(check(bare, 'asp-appointed').status).toBe('not_assessed');
  });
});

describe('gappy sample', () => {
  const report = runReadiness(GAPPY_SAMPLE, { ...FULL_PROCESS, aspAppointed: false });

  it('fails the buyer check on the missing Peppol identifier', () => {
    const buyer = check(report, 'buyer-details');
    expect(buyer.status).toBe('fail');
    expect(buyer.detail).toContain('peppolId');
  });

  it('fails currency: EUR invoice without an AED tax total', () => {
    const currency = check(report, 'currency');
    expect(currency.status).toBe('fail');
    expect(currency.detail).toContain('EUR');
  });

  it('fails line items on the missing unit of measure', () => {
    const lines = check(report, 'line-items');
    expect(lines.status).toBe('fail');
    expect(lines.detail).toContain('unitOfMeasure');
  });

  it('fails the 14-day issuance window at 20 days', () => {
    const timing = check(report, 'issuance-timing');
    expect(timing.status).toBe('fail');
    expect(timing.detail).toContain('20 days');
  });

  it('fails the ASP check when answered no', () => {
    expect(check(report, 'asp-appointed').status).toBe('fail');
  });

  it('derives the Article 7 umbrella failure from field-level failures', () => {
    const umbrella = check(report, 'mandatory-fields');
    expect(umbrella.status).toBe('fail');
    expect(umbrella.detail).toContain('MOF-FIELDS-2026/REQ-2');
  });

  it('orders fixes worst severity first', () => {
    const severities = report.fixes.map(f => f.severity);
    const order = { critical: 0, high: 1, medium: 2 } as const;
    const sorted = [...severities].sort((a, b) => order[a] - order[b]);
    expect(severities).toEqual(sorted);
  });
});

describe('individual rules', () => {
  it('rejects a malformed seller TRN', () => {
    const invoice = {
      ...PASSING_SAMPLE,
      seller: { ...PASSING_SAMPLE.seller, trn: '12345' },
    };
    const result = check(runReadiness(invoice), 'seller-details');
    expect(result.status).toBe('fail');
    expect(result.detail).toContain('15-digit');
  });

  it('accepts a TRN with separators', () => {
    const invoice = {
      ...PASSING_SAMPLE,
      seller: { ...PASSING_SAMPLE.seller, trn: '100 1234 5670 0003' },
    };
    expect(check(runReadiness(invoice), 'seller-details').status).toBe('pass');
  });

  it('flags inconsistent document totals', () => {
    const invoice = {
      ...PASSING_SAMPLE,
      totals: { lineNetTotal: 15400, vatTotal: 770, payableTotal: 15000 },
    };
    const result = check(runReadiness(invoice), 'tax-breakdown-totals');
    expect(result.status).toBe('fail');
    expect(result.detail).toContain('payableTotal');
  });

  it('requires line-level AED VAT amounts on foreign-currency invoices', () => {
    const invoice = {
      ...PASSING_SAMPLE,
      invoice: { ...PASSING_SAMPLE.invoice, currencyCode: 'USD' },
      totals: { ...PASSING_SAMPLE.totals, vatTotalAed: 770 },
    };
    const result = check(runReadiness(invoice), 'tax-breakdown-totals');
    expect(result.status).toBe('fail');
    expect(result.detail).toContain('vatAmountAed');
  });

  it('fails the structured-format check for PDF issuance', () => {
    const result = check(runReadiness(PASSING_SAMPLE, { format: 'pdf' }), 'structured-format');
    expect(result.status).toBe('fail');
  });

  it('treats wrong-typed fields as missing instead of crashing', () => {
    const report = runReadiness({ seller: 'not-an-object', lines: 'nope', invoice: 42 });
    expect(check(report, 'seller-details').status).toBe('fail');
    expect(check(report, 'line-items').status).toBe('fail');
    expect(check(report, 'mandatory-fields').status).toBe('fail');
  });

  it('handles a completely empty payload', () => {
    const report = runReadiness({});
    expect(report.summary.fail).toBeGreaterThan(0);
    expect(report.summary.readyPercent).toBe(0);
  });
});

describe('arabic report', () => {
  it('localizes labels, fixes, and details with identical statuses', () => {
    const enReport = runReadiness(GAPPY_SAMPLE, FULL_PROCESS);
    const arReport = runReadiness(GAPPY_SAMPLE, FULL_PROCESS, 'ar');
    expect(arReport.summary).toEqual(enReport.summary);
    expect(arReport.checks.map(c => c.status)).toEqual(enReport.checks.map(c => c.status));
    const buyer = arReport.checks.find(c => c.id === 'buyer-details');
    expect(buyer?.label).toContain('المشتري');
    expect(buyer?.detail).toContain('peppolId');
    expect(buyer?.fix).toContain('Peppol');
  });

  it('keeps JSON field names untranslated inside arabic details', () => {
    const report = runReadiness({}, {}, 'ar');
    const seller = report.checks.find(c => c.id === 'seller-details');
    expect(seller?.detail).toContain('trn');
    expect(seller?.detail).toContain('الناقصة');
  });
});
