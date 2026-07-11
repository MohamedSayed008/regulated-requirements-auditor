import type { Invoice } from './invoice';

/**
 * Sends the invoice to the tax authority.
 *
 * SEEDED VIOLATION (MD243-2025/REQ-3): both the Issuer and the Recipient must
 * appoint an Accredited Service Provider (ASP), and invoices are exchanged and
 * reported through the ASP network, not sent directly. This posts the invoice
 * straight to an FTA endpoint with no ASP in the path.
 */
export async function transmitToFta(invoice: Invoice, endpoint: string): Promise<Response> {
  return fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(invoice),
  });
}
