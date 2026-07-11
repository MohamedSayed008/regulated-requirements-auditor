import type { Invoice } from './invoice';

/**
 * Persists issued invoices.
 *
 * SEEDED VIOLATION (MD243-2025/REQ-10): a person subject to the eInvoicing
 * system must store all invoices and their associated data within the UAE and
 * keep them accessible to the FTA. This configures object storage in a US
 * region, so the records are held outside the UAE.
 */
const STORAGE_REGION = 'us-east-1';

export interface StoredInvoice {
  key: string;
  region: string;
  payload: Invoice;
}

export function storeInvoice(invoice: Invoice): StoredInvoice {
  return {
    key: `invoices/${invoice.invoiceNumber}.json`,
    region: STORAGE_REGION,
    payload: invoice,
  };
}
