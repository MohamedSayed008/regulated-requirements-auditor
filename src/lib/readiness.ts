import { z } from 'zod';
import { type Lang } from '@/lib/i18n';
import { type ReadinessDetailStrings, READINESS_STRINGS } from '@/lib/readiness-strings';

/**
 * eInvoicing readiness engine (v5, Track B product slice).
 *
 * Deterministic field-level validation of an invoice payload against the UAE
 * eInvoicing corpus: every check is keyed to a citable requirement unit
 * (MOF-FIELDS-2026, MD243-2025, MOF-EINV), so a failure always points at the
 * exact ministerial text it violates. No model calls: this is the corpus and
 * the audit thesis packaged as a product check, not net-new AI.
 *
 * The invoice input is untrusted JSON; checks read it defensively (a field of
 * the wrong type counts as missing) so any paste produces a report instead of
 * a validation stack trace. Report language follows the `lang` argument; the
 * strings live in readiness-strings.ts (English and Arabic).
 */

export type CheckStatus = 'pass' | 'fail' | 'not_assessed';

/** Ordered: what to fix first. */
export const READINESS_SEVERITIES = ['critical', 'high', 'medium'] as const;
export type ReadinessSeverity = (typeof READINESS_SEVERITIES)[number];

export const READINESS_SEVERITY_ORDER: Record<ReadinessSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
};

/**
 * Process facts the invoice payload cannot carry: how invoices are issued and
 * where the data lives. Unanswered questions report as not_assessed rather
 * than guessed.
 */
export const processAnswersSchema = z.object({
  format: z.enum(['structured', 'pdf', 'image', 'email']).optional(),
  aspAppointed: z.boolean().optional(),
  storageInUae: z.boolean().optional(),
  canIssueCreditNotes: z.boolean().optional(),
});

export type ProcessAnswers = z.infer<typeof processAnswersSchema>;

export interface ReadinessCheckResult {
  id: string;
  requirementId: string;
  label: string;
  severity: ReadinessSeverity;
  status: CheckStatus;
  detail: string;
  fix: string;
}

export interface ReadinessReport {
  corpusId: 'uae-einvoicing';
  checks: ReadinessCheckResult[];
  summary: {
    pass: number;
    fail: number;
    notAssessed: number;
    /** pass / (pass + fail), in percent; not_assessed is excluded. */
    readyPercent: number;
  };
  /** Failed checks only, worst severity first: the fix-first list. */
  fixes: ReadinessCheckResult[];
}

// ---------------------------------------------------------------------------
// Defensive accessors: wrong-typed fields count as absent.

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function section(invoice: unknown, key: string): Record<string, unknown> {
  if (!isRecord(invoice)) return {};
  const value = invoice[key];
  return isRecord(value) ? value : {};
}

function rows(invoice: unknown, key: string): unknown[] {
  if (!isRecord(invoice)) return [];
  const value = invoice[key];
  return Array.isArray(value) ? value : [];
}

function str(source: Record<string, unknown>, key: string): string | undefined {
  const value = source[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function num(source: Record<string, unknown>, key: string): number | undefined {
  const value = source[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/** UAE TRN: 15 digits (separators tolerated); participant id is its first 10. */
function isTrn(value: string): boolean {
  return /^\d{15}$/.test(value.replace(/[\s-]/g, ''));
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}/.test(value) && !Number.isNaN(Date.parse(value));
}

function moneyEquals(a: number, b: number): boolean {
  return Math.abs(a - b) <= 0.01;
}

function missingList(source: Record<string, unknown>, fields: [string, 'str' | 'num'][]): string[] {
  return fields
    .filter(([key, kind]) =>
      kind === 'str' ? str(source, key) === undefined : num(source, key) === undefined
    )
    .map(([key]) => key);
}

// ---------------------------------------------------------------------------
// Checks. Each is keyed to one requirement unit id from the corpus; labels,
// fixes, and detail wording come from READINESS_STRINGS per language.

interface CheckOutcome {
  status: CheckStatus;
  detail: string;
}

interface CheckDefinition {
  id: string;
  requirementId: string;
  severity: ReadinessSeverity;
  run: (invoice: unknown, process: ProcessAnswers, d: ReadinessDetailStrings) => CheckOutcome;
}

const LINE_FIELDS: [string, 'str' | 'num'][] = [
  ['description', 'str'],
  ['quantity', 'num'],
  ['unitOfMeasure', 'str'],
  ['unitPrice', 'num'],
  ['lineNet', 'num'],
  ['taxCategory', 'str'],
  ['vatRate', 'num'],
];

const FIELD_CHECK_IDS = [
  'seller-details',
  'buyer-details',
  'invoice-identification',
  'currency',
  'line-items',
  'tax-breakdown-totals',
] as const;

const CHECKS: CheckDefinition[] = [
  {
    id: 'structured-format',
    requirementId: 'MOF-EINV/REQ-1',
    severity: 'critical',
    run: (_invoice, process, d) => {
      if (process.format === undefined) {
        return { status: 'not_assessed', detail: d.formatNotProvided };
      }
      if (process.format === 'structured') {
        return { status: 'pass', detail: d.formatPass };
      }
      return { status: 'fail', detail: d.formatFail(process.format) };
    },
  },
  {
    id: 'seller-details',
    requirementId: 'MOF-FIELDS-2026/REQ-1',
    severity: 'critical',
    run: (invoice, _process, d) => {
      const seller = section(invoice, 'seller');
      const missing = missingList(seller, [
        ['name', 'str'],
        ['address', 'str'],
        ['trn', 'str'],
      ]);
      if (missing.length > 0) {
        return { status: 'fail', detail: d.missingSellerFields(missing) };
      }
      const trn = str(seller, 'trn');
      if (trn && !isTrn(trn)) {
        return { status: 'fail', detail: d.sellerTrnInvalid(trn) };
      }
      return { status: 'pass', detail: d.sellerPass };
    },
  },
  {
    id: 'buyer-details',
    requirementId: 'MOF-FIELDS-2026/REQ-2',
    severity: 'critical',
    run: (invoice, _process, d) => {
      const buyer = section(invoice, 'buyer');
      const missing = missingList(buyer, [
        ['name', 'str'],
        ['address', 'str'],
        ['peppolId', 'str'],
      ]);
      const trn = str(buyer, 'trn');
      if (trn !== undefined && !isTrn(trn)) {
        return { status: 'fail', detail: d.buyerTrnInvalid(trn) };
      }
      if (missing.length > 0) {
        return { status: 'fail', detail: d.missingBuyerFields(missing) };
      }
      return { status: 'pass', detail: trn === undefined ? d.buyerPassNoTrn : d.buyerPass };
    },
  },
  {
    id: 'invoice-identification',
    requirementId: 'MOF-FIELDS-2026/REQ-3',
    severity: 'critical',
    run: (invoice, _process, d) => {
      const details = section(invoice, 'invoice');
      const missing = missingList(details, [
        ['number', 'str'],
        ['issueDate', 'str'],
      ]);
      if (missing.length > 0) {
        return { status: 'fail', detail: d.missingInvoiceFields(missing) };
      }
      const issueDate = str(details, 'issueDate');
      if (issueDate && !isIsoDate(issueDate)) {
        return { status: 'fail', detail: d.issueDateInvalid(issueDate) };
      }
      return { status: 'pass', detail: d.invoiceIdPass };
    },
  },
  {
    id: 'currency',
    requirementId: 'MOF-FIELDS-2026/REQ-4',
    severity: 'high',
    run: (invoice, _process, d) => {
      const details = section(invoice, 'invoice');
      const currency = str(details, 'currencyCode');
      if (currency === undefined) {
        return { status: 'fail', detail: d.currencyMissing };
      }
      if (!/^[A-Z]{3}$/.test(currency)) {
        return { status: 'fail', detail: d.currencyNotIso(currency) };
      }
      if (currency !== 'AED' && num(section(invoice, 'totals'), 'vatTotalAed') === undefined) {
        return { status: 'fail', detail: d.currencyMissingAedTotal(currency) };
      }
      return { status: 'pass', detail: d.currencyPass(currency) };
    },
  },
  {
    id: 'line-items',
    requirementId: 'MOF-FIELDS-2026/REQ-5',
    severity: 'critical',
    run: (invoice, _process, d) => {
      const lines = rows(invoice, 'lines');
      if (lines.length === 0) {
        return { status: 'fail', detail: d.noLineItems };
      }
      const problems: string[] = [];
      lines.forEach((line, index) => {
        const record = isRecord(line) ? line : {};
        const missing = missingList(record, LINE_FIELDS);
        if (missing.length > 0) problems.push(d.lineMissing(index + 1, missing));
      });
      if (problems.length > 0) {
        return { status: 'fail', detail: d.lineProblems(problems) };
      }
      return { status: 'pass', detail: d.linesPass(lines.length) };
    },
  },
  {
    id: 'tax-breakdown-totals',
    requirementId: 'MOF-FIELDS-2026/REQ-6',
    severity: 'high',
    run: (invoice, _process, d) => {
      const breakdown = rows(invoice, 'taxBreakdown');
      if (breakdown.length === 0) {
        return { status: 'fail', detail: d.noTaxBreakdown };
      }
      const badRows: string[] = [];
      breakdown.forEach((row, index) => {
        const record = isRecord(row) ? row : {};
        const missing = missingList(record, [
          ['taxCategory', 'str'],
          ['taxableAmount', 'num'],
          ['vatRate', 'num'],
          ['vatAmount', 'num'],
        ]);
        if (missing.length > 0) badRows.push(d.breakdownRowMissing(index + 1, missing));
      });
      if (badRows.length > 0) {
        return { status: 'fail', detail: d.breakdownIncomplete(badRows) };
      }

      const totals = section(invoice, 'totals');
      const missingTotals = missingList(totals, [
        ['lineNetTotal', 'num'],
        ['vatTotal', 'num'],
        ['payableTotal', 'num'],
      ]);
      if (missingTotals.length > 0) {
        return { status: 'fail', detail: d.missingTotals(missingTotals) };
      }

      const currency = str(section(invoice, 'invoice'), 'currencyCode');
      if (currency !== undefined && currency !== 'AED') {
        const linesMissingAed = rows(invoice, 'lines')
          .map((line, index) => ({ line, index }))
          .filter(({ line }) => num(isRecord(line) ? line : {}, 'vatAmountAed') === undefined)
          .map(({ index }) => index + 1);
        if (linesMissingAed.length > 0) {
          return { status: 'fail', detail: d.linesMissingAed(currency, linesMissingAed) };
        }
      }

      const lineNetSum = rows(invoice, 'lines').reduce<number>(
        (sum, line) => sum + (num(isRecord(line) ? line : {}, 'lineNet') ?? 0),
        0
      );
      const vatSum = breakdown.reduce<number>(
        (sum, row) => sum + (num(isRecord(row) ? row : {}, 'vatAmount') ?? 0),
        0
      );
      const lineNetTotal = num(totals, 'lineNetTotal') ?? 0;
      const vatTotal = num(totals, 'vatTotal') ?? 0;
      const payableTotal = num(totals, 'payableTotal') ?? 0;
      const mismatches: string[] = [];
      if (!moneyEquals(lineNetSum, lineNetTotal)) {
        mismatches.push(d.mismatchLineNet(lineNetSum.toFixed(2), lineNetTotal.toFixed(2)));
      }
      if (!moneyEquals(vatSum, vatTotal)) {
        mismatches.push(d.mismatchVat(vatSum.toFixed(2), vatTotal.toFixed(2)));
      }
      if (!moneyEquals(lineNetTotal + vatTotal, payableTotal)) {
        mismatches.push(
          d.mismatchPayable((lineNetTotal + vatTotal).toFixed(2), payableTotal.toFixed(2))
        );
      }
      if (mismatches.length > 0) {
        return { status: 'fail', detail: d.totalsMismatch(mismatches) };
      }
      return { status: 'pass', detail: d.totalsPass };
    },
  },
  {
    id: 'issuance-timing',
    requirementId: 'MD243-2025/REQ-6',
    severity: 'medium',
    run: (invoice, _process, d) => {
      const details = section(invoice, 'invoice');
      const issueDate = str(details, 'issueDate');
      const transactionDate = str(details, 'transactionDate');
      if (!issueDate || !transactionDate || !isIsoDate(issueDate) || !isIsoDate(transactionDate)) {
        return { status: 'not_assessed', detail: d.timingNeedsDates };
      }
      const days = Math.round(
        (Date.parse(issueDate) - Date.parse(transactionDate)) / (24 * 60 * 60 * 1000)
      );
      if (days > 14) {
        return { status: 'fail', detail: d.timingFail(days) };
      }
      return { status: 'pass', detail: d.timingPass(days) };
    },
  },
  {
    id: 'credit-notes',
    requirementId: 'MD243-2025/REQ-2',
    severity: 'medium',
    run: (_invoice, process, d) => {
      if (process.canIssueCreditNotes === undefined) {
        return { status: 'not_assessed', detail: d.creditNotesNotProvided };
      }
      if (process.canIssueCreditNotes) {
        return { status: 'pass', detail: d.creditNotesPass };
      }
      return { status: 'fail', detail: d.creditNotesFail };
    },
  },
  {
    id: 'asp-appointed',
    requirementId: 'MD243-2025/REQ-3',
    severity: 'high',
    run: (_invoice, process, d) => {
      if (process.aspAppointed === undefined) {
        return { status: 'not_assessed', detail: d.aspNotProvided };
      }
      if (process.aspAppointed) {
        return { status: 'pass', detail: d.aspPass };
      }
      return { status: 'fail', detail: d.aspFail };
    },
  },
  {
    id: 'data-residency',
    requirementId: 'MD243-2025/REQ-10',
    severity: 'high',
    run: (_invoice, process, d) => {
      if (process.storageInUae === undefined) {
        return { status: 'not_assessed', detail: d.residencyNotProvided };
      }
      if (process.storageInUae) {
        return { status: 'pass', detail: d.residencyPass };
      }
      return { status: 'fail', detail: d.residencyFail };
    },
  },
];

// ---------------------------------------------------------------------------

export function runReadiness(
  invoice: unknown,
  process: ProcessAnswers = {},
  lang: Lang = 'en'
): ReadinessReport {
  const strings = READINESS_STRINGS[lang];
  const results: ReadinessCheckResult[] = CHECKS.map(check => {
    const outcome = check.run(invoice, process, strings.d);
    return {
      id: check.id,
      requirementId: check.requirementId,
      label: strings.labels[check.id],
      severity: check.severity,
      status: outcome.status,
      detail: outcome.detail,
      fix: strings.fixes[check.id],
    };
  });

  // Umbrella rule (Article 7): an invoice missing any mandatory prescribed
  // field is not a valid eInvoice. Derived from the six field-level checks.
  const fieldResults = results.filter(r => (FIELD_CHECK_IDS as readonly string[]).includes(r.id));
  const failedFields = fieldResults.filter(r => r.status === 'fail');
  results.push({
    id: 'mandatory-fields',
    requirementId: 'MD243-2025/REQ-8',
    label: strings.labels['mandatory-fields'],
    severity: 'critical',
    status: failedFields.length > 0 ? 'fail' : 'pass',
    detail:
      failedFields.length > 0
        ? strings.d.umbrellaFail(failedFields.map(r => r.requirementId))
        : strings.d.umbrellaPass,
    fix: strings.fixes['mandatory-fields'],
  });

  const pass = results.filter(r => r.status === 'pass').length;
  const fail = results.filter(r => r.status === 'fail').length;
  const notAssessed = results.filter(r => r.status === 'not_assessed').length;
  const assessed = pass + fail;

  const fixes = results
    .filter(r => r.status === 'fail')
    .sort((a, b) => READINESS_SEVERITY_ORDER[a.severity] - READINESS_SEVERITY_ORDER[b.severity]);

  return {
    corpusId: 'uae-einvoicing',
    checks: results,
    summary: {
      pass,
      fail,
      notAssessed,
      readyPercent: assessed === 0 ? 0 : Math.round((pass / assessed) * 100),
    },
    fixes,
  };
}

/** Ids of every requirement unit the engine cites; used by tests and the UI. */
export function citedRequirementIds(): string[] {
  return [...new Set([...CHECKS.map(c => c.requirementId), 'MD243-2025/REQ-8'])];
}
