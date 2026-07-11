import type { Invoice } from './invoice';

/**
 * Renders an invoice for delivery.
 *
 * SEEDED VIOLATION (MOF-EINV/REQ-1): under the UAE eInvoicing mandate an
 * eInvoice must be structured invoice data (Peppol PINT AE / XML) exchanged
 * electronically. A PDF is explicitly not an eInvoice. This renders the invoice
 * as a human-readable PDF-style text document and treats that as the invoice
 * to send.
 */
export function renderInvoice(invoice: Invoice): string {
  const lines = invoice.lines
    .map(l => `${l.description}  ${l.quantity} x ${l.unitPrice}`)
    .join('\n');
  return [
    '--- TAX INVOICE (PDF) ---',
    `Invoice: ${invoice.invoiceNumber}`,
    `Date: ${invoice.issueDate}`,
    `Seller: ${invoice.sellerName} (${invoice.sellerTrn})`,
    `Buyer: ${invoice.buyerName}`,
    lines,
    `Total: ${invoice.total} ${invoice.currency}`,
  ].join('\n');
}
