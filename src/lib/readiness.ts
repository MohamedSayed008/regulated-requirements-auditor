import { z } from 'zod';

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
 * a validation stack trace.
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
// Checks. Each is keyed to one requirement unit id from the corpus.

interface CheckOutcome {
  status: CheckStatus;
  detail: string;
}

interface CheckDefinition {
  id: string;
  requirementId: string;
  label: string;
  severity: ReadinessSeverity;
  fix: string;
  run: (invoice: unknown, process: ProcessAnswers) => CheckOutcome;
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
    label: 'Invoices issued as structured data, not PDF or image',
    severity: 'critical',
    fix: 'Issue invoices as structured machine-readable data through your billing system. A PDF, scan, image, or emailed invoice is not an eInvoice under the mandate.',
    run: (_invoice, process) => {
      if (process.format === undefined) {
        return { status: 'not_assessed', detail: 'Issuance format not provided.' };
      }
      if (process.format === 'structured') {
        return { status: 'pass', detail: 'Invoices are issued as structured data.' };
      }
      return {
        status: 'fail',
        detail: `Invoices are issued as ${process.format}, which the mandate does not recognise as an eInvoice.`,
      };
    },
  },
  {
    id: 'seller-details',
    requirementId: 'MOF-FIELDS-2026/REQ-1',
    label: 'Seller name, address, and TRN',
    severity: 'critical',
    fix: 'Add the seller name, address, and 15-digit Tax Registration Number to every invoice; the first 10 digits form the seller participant identifier.',
    run: invoice => {
      const seller = section(invoice, 'seller');
      const missing = missingList(seller, [
        ['name', 'str'],
        ['address', 'str'],
        ['trn', 'str'],
      ]);
      if (missing.length > 0) {
        return { status: 'fail', detail: `Missing seller field(s): ${missing.join(', ')}.` };
      }
      const trn = str(seller, 'trn');
      if (trn && !isTrn(trn)) {
        return {
          status: 'fail',
          detail: `Seller TRN "${trn}" is not a 15-digit Tax Registration Number.`,
        };
      }
      return { status: 'pass', detail: 'Seller name, address, and TRN present and well-formed.' };
    },
  },
  {
    id: 'buyer-details',
    requirementId: 'MOF-FIELDS-2026/REQ-2',
    label: 'Buyer name, address, TRN, and Peppol identifier',
    severity: 'critical',
    fix: 'Capture the buyer name, address, TRN (where the buyer is tax-registered), and the buyer Peppol participant identifier used for routing.',
    run: invoice => {
      const buyer = section(invoice, 'buyer');
      const missing = missingList(buyer, [
        ['name', 'str'],
        ['address', 'str'],
        ['peppolId', 'str'],
      ]);
      const trn = str(buyer, 'trn');
      if (trn !== undefined && !isTrn(trn)) {
        return {
          status: 'fail',
          detail: `Buyer TRN "${trn}" is not a 15-digit Tax Registration Number.`,
        };
      }
      if (missing.length > 0) {
        return { status: 'fail', detail: `Missing buyer field(s): ${missing.join(', ')}.` };
      }
      return {
        status: 'pass',
        detail:
          trn === undefined
            ? 'Buyer details present (no TRN given: acceptable only if the buyer is not tax-registered).'
            : 'Buyer name, address, TRN, and Peppol identifier present.',
      };
    },
  },
  {
    id: 'invoice-identification',
    requirementId: 'MOF-FIELDS-2026/REQ-3',
    label: 'Unique invoice number and issue date',
    severity: 'critical',
    fix: 'Give every invoice a unique invoice number and an issue date (YYYY-MM-DD).',
    run: invoice => {
      const details = section(invoice, 'invoice');
      const missing = missingList(details, [
        ['number', 'str'],
        ['issueDate', 'str'],
      ]);
      if (missing.length > 0) {
        return { status: 'fail', detail: `Missing invoice field(s): ${missing.join(', ')}.` };
      }
      const issueDate = str(details, 'issueDate');
      if (issueDate && !isIsoDate(issueDate)) {
        return { status: 'fail', detail: `Issue date "${issueDate}" is not a valid date.` };
      }
      return { status: 'pass', detail: 'Invoice number and issue date present.' };
    },
  },
  {
    id: 'currency',
    requirementId: 'MOF-FIELDS-2026/REQ-4',
    label: 'Currency code, with tax total in AED',
    severity: 'high',
    fix: 'State the invoice currency as a 3-letter code, and when invoicing in a foreign currency also provide the total tax amount in AED.',
    run: invoice => {
      const details = section(invoice, 'invoice');
      const currency = str(details, 'currencyCode');
      if (currency === undefined) {
        return { status: 'fail', detail: 'Missing invoice currency code.' };
      }
      if (!/^[A-Z]{3}$/.test(currency)) {
        return {
          status: 'fail',
          detail: `Currency code "${currency}" is not a 3-letter ISO code.`,
        };
      }
      if (currency !== 'AED' && num(section(invoice, 'totals'), 'vatTotalAed') === undefined) {
        return {
          status: 'fail',
          detail: `Invoice is in ${currency} but the tax total in AED (totals.vatTotalAed) is missing.`,
        };
      }
      return { status: 'pass', detail: `Currency ${currency}, tax total available in AED.` };
    },
  },
  {
    id: 'line-items',
    requirementId: 'MOF-FIELDS-2026/REQ-5',
    label: 'Line items: description, quantity, UoM, price, net, tax category, VAT rate',
    severity: 'critical',
    fix: 'Provide every line with description, quantity, unit of measure, unit price, line net amount, tax category code, and VAT rate.',
    run: invoice => {
      const lines = rows(invoice, 'lines');
      if (lines.length === 0) {
        return { status: 'fail', detail: 'No line items found.' };
      }
      const problems: string[] = [];
      lines.forEach((line, index) => {
        const record = isRecord(line) ? line : {};
        const missing = missingList(record, LINE_FIELDS);
        if (missing.length > 0) problems.push(`line ${index + 1}: ${missing.join(', ')}`);
      });
      if (problems.length > 0) {
        return { status: 'fail', detail: `Missing line fields. ${problems.join('; ')}.` };
      }
      return { status: 'pass', detail: `All ${lines.length} line item(s) carry the seven fields.` };
    },
  },
  {
    id: 'tax-breakdown-totals',
    requirementId: 'MOF-FIELDS-2026/REQ-6',
    label: 'VAT breakdown per category and consistent document totals',
    severity: 'high',
    fix: 'Include a VAT breakdown per tax category (category, taxable amount, rate, VAT amount), line-level VAT in AED for foreign-currency invoices, and document totals that add up.',
    run: invoice => {
      const breakdown = rows(invoice, 'taxBreakdown');
      if (breakdown.length === 0) {
        return { status: 'fail', detail: 'No VAT tax breakdown found.' };
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
        if (missing.length > 0) badRows.push(`breakdown ${index + 1}: ${missing.join(', ')}`);
      });
      if (badRows.length > 0) {
        return { status: 'fail', detail: `Incomplete tax breakdown. ${badRows.join('; ')}.` };
      }

      const totals = section(invoice, 'totals');
      const missingTotals = missingList(totals, [
        ['lineNetTotal', 'num'],
        ['vatTotal', 'num'],
        ['payableTotal', 'num'],
      ]);
      if (missingTotals.length > 0) {
        return { status: 'fail', detail: `Missing total(s): ${missingTotals.join(', ')}.` };
      }

      const currency = str(section(invoice, 'invoice'), 'currencyCode');
      if (currency !== undefined && currency !== 'AED') {
        const linesMissingAed = rows(invoice, 'lines')
          .map((line, index) => ({ line, index }))
          .filter(({ line }) => num(isRecord(line) ? line : {}, 'vatAmountAed') === undefined)
          .map(({ index }) => index + 1);
        if (linesMissingAed.length > 0) {
          return {
            status: 'fail',
            detail: `Invoice is in ${currency} but line(s) ${linesMissingAed.join(', ')} lack the line-level VAT amount in AED (vatAmountAed).`,
          };
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
        mismatches.push(
          `sum of line nets ${lineNetSum.toFixed(2)} ≠ lineNetTotal ${lineNetTotal.toFixed(2)}`
        );
      }
      if (!moneyEquals(vatSum, vatTotal)) {
        mismatches.push(
          `sum of VAT amounts ${vatSum.toFixed(2)} ≠ vatTotal ${vatTotal.toFixed(2)}`
        );
      }
      if (!moneyEquals(lineNetTotal + vatTotal, payableTotal)) {
        mismatches.push(
          `lineNetTotal + vatTotal ${(lineNetTotal + vatTotal).toFixed(2)} ≠ payableTotal ${payableTotal.toFixed(2)}`
        );
      }
      if (mismatches.length > 0) {
        return { status: 'fail', detail: `Totals do not add up: ${mismatches.join('; ')}.` };
      }
      return { status: 'pass', detail: 'Tax breakdown complete and totals consistent.' };
    },
  },
  {
    id: 'issuance-timing',
    requirementId: 'MD243-2025/REQ-6',
    label: 'Issued within 14 days of the business transaction',
    severity: 'medium',
    fix: 'Issue and transmit the eInvoice within 14 days of the date of the business transaction (the earlier of transaction date or payment received).',
    run: invoice => {
      const details = section(invoice, 'invoice');
      const issueDate = str(details, 'issueDate');
      const transactionDate = str(details, 'transactionDate');
      if (!issueDate || !transactionDate || !isIsoDate(issueDate) || !isIsoDate(transactionDate)) {
        return {
          status: 'not_assessed',
          detail: 'Needs both issueDate and transactionDate to assess the 14-day window.',
        };
      }
      const days = Math.round(
        (Date.parse(issueDate) - Date.parse(transactionDate)) / (24 * 60 * 60 * 1000)
      );
      if (days > 14) {
        return {
          status: 'fail',
          detail: `Issued ${days} days after the business transaction (limit is 14).`,
        };
      }
      return { status: 'pass', detail: `Issued ${days} day(s) after the business transaction.` };
    },
  },
  {
    id: 'credit-notes',
    requirementId: 'MD243-2025/REQ-2',
    label: 'Electronic credit notes for cancellations and corrections',
    severity: 'medium',
    fix: 'Make sure your system can issue an electronic credit note through the same channel whenever an invoice is cancelled, adjusted, or corrected.',
    run: (_invoice, process) => {
      if (process.canIssueCreditNotes === undefined) {
        return { status: 'not_assessed', detail: 'Credit-note capability not provided.' };
      }
      if (process.canIssueCreditNotes) {
        return { status: 'pass', detail: 'System can issue electronic credit notes.' };
      }
      return { status: 'fail', detail: 'System cannot issue electronic credit notes.' };
    },
  },
  {
    id: 'asp-appointed',
    requirementId: 'MD243-2025/REQ-3',
    label: 'Accredited Service Provider appointed',
    severity: 'high',
    fix: "Appoint an Accredited Service Provider from the Ministry's published list; invoices must flow through an ASP under the 5-corner model.",
    run: (_invoice, process) => {
      if (process.aspAppointed === undefined) {
        return { status: 'not_assessed', detail: 'ASP appointment not provided.' };
      }
      if (process.aspAppointed) {
        return { status: 'pass', detail: 'An Accredited Service Provider is appointed.' };
      }
      return { status: 'fail', detail: 'No Accredited Service Provider appointed yet.' };
    },
  },
  {
    id: 'data-residency',
    requirementId: 'MD243-2025/REQ-10',
    label: 'Invoice data stored in the UAE and accessible to the FTA',
    severity: 'high',
    fix: 'Store eInvoices, credit notes, and associated data within the UAE for the Tax Procedures Law retention period, accessible to the Federal Tax Authority.',
    run: (_invoice, process) => {
      if (process.storageInUae === undefined) {
        return { status: 'not_assessed', detail: 'Storage location not provided.' };
      }
      if (process.storageInUae) {
        return { status: 'pass', detail: 'Invoice data is stored within the UAE.' };
      }
      return { status: 'fail', detail: 'Invoice data is not stored within the UAE.' };
    },
  },
];

// ---------------------------------------------------------------------------

export function runReadiness(invoice: unknown, process: ProcessAnswers = {}): ReadinessReport {
  const results: ReadinessCheckResult[] = CHECKS.map(check => {
    const outcome = check.run(invoice, process);
    return {
      id: check.id,
      requirementId: check.requirementId,
      label: check.label,
      severity: check.severity,
      status: outcome.status,
      detail: outcome.detail,
      fix: check.fix,
    };
  });

  // Umbrella rule (Article 7): an invoice missing any mandatory prescribed
  // field is not a valid eInvoice. Derived from the six field-level checks.
  const fieldResults = results.filter(r => (FIELD_CHECK_IDS as readonly string[]).includes(r.id));
  const failedFields = fieldResults.filter(r => r.status === 'fail');
  results.push({
    id: 'mandatory-fields',
    requirementId: 'MD243-2025/REQ-8',
    label: 'All mandatory prescribed data fields present',
    severity: 'critical',
    status: failedFields.length > 0 ? 'fail' : 'pass',
    detail:
      failedFields.length > 0
        ? `Not a valid eInvoice while field checks fail: ${failedFields.map(r => r.requirementId).join(', ')}.`
        : 'All field-level checks pass.',
    fix: 'Resolve every failing field-level check; Article 7 makes an invoice missing any mandatory field invalid.',
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
