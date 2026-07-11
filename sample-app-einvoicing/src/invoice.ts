/**
 * Invoice model and builder for a UAE billing system.
 */

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
}

export interface Invoice {
  invoiceNumber: string;
  issueDate: string;
  currency: string;
  sellerName: string;
  sellerTrn: string;
  buyerName: string;
  lines: LineItem[];
  total: number;
}

/**
 * Builds the invoice payload.
 *
 * SEEDED VIOLATION (MOF-FIELDS-2026/REQ-2): the buyer's Tax Registration
 * Number (TRN) is a mandatory field on a valid eInvoice, but this builder does
 * not capture or emit a buyer TRN at all.
 *
 * SEEDED VIOLATION (MOF-FIELDS-2026/REQ-6): the invoice reports a single total
 * with no VAT tax breakdown per tax category, which a valid eInvoice must
 * include.
 */
export function buildInvoice(input: {
  invoiceNumber: string;
  currency: string;
  sellerName: string;
  sellerTrn: string;
  buyerName: string;
  lines: LineItem[];
}): Invoice {
  const total = input.lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
  return {
    invoiceNumber: input.invoiceNumber,
    issueDate: new Date().toISOString(),
    currency: input.currency,
    sellerName: input.sellerName,
    sellerTrn: input.sellerTrn,
    buyerName: input.buyerName,
    lines: input.lines,
    total,
  };
}
