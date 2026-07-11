import type { Invoice } from './invoice';

/**
 * Pre-transmission checks. Correct implementation, included to measure audit
 * precision: the auditor must NOT raise a finding here.
 */
export function hasUniqueInvoiceNumber(invoice: Invoice, existingNumbers: Set<string>): boolean {
  return invoice.invoiceNumber.length > 0 && !existingNumbers.has(invoice.invoiceNumber);
}

export function hasValidCurrency(invoice: Invoice): boolean {
  return /^[A-Z]{3}$/.test(invoice.currency);
}

export function hasIssueDate(invoice: Invoice): boolean {
  return !Number.isNaN(Date.parse(invoice.issueDate));
}
