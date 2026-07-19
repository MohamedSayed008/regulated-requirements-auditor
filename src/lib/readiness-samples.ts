/**
 * Sample invoices for the readiness checker. Fictional businesses; amounts
 * chosen so the passing sample's totals reconcile exactly and the gappy
 * sample trips specific, teachable failures (missing buyer TRN and Peppol id,
 * missing line UoM, VAT total mismatch, 20-day issuance gap, foreign currency
 * without AED tax total).
 */

export const PASSING_SAMPLE = {
  seller: {
    name: 'Desert Rose Trading LLC',
    address: 'Office 1204, Marina Plaza, Dubai, UAE',
    trn: '100123456700003',
  },
  buyer: {
    name: 'Oasis Facilities Management LLC',
    address: 'Al Qouz Industrial 3, Dubai, UAE',
    trn: '100765432100003',
    peppolId: '0235:1007654321',
  },
  invoice: {
    number: 'INV-2026-0142',
    issueDate: '2026-07-10',
    transactionDate: '2026-07-01',
    currencyCode: 'AED',
  },
  lines: [
    {
      description: 'Facility cleaning services, June 2026',
      quantity: 1,
      unitOfMeasure: 'EA',
      unitPrice: 12000,
      lineNet: 12000,
      taxCategory: 'S',
      vatRate: 5,
    },
    {
      description: 'Consumables restock',
      quantity: 40,
      unitOfMeasure: 'BOX',
      unitPrice: 85,
      lineNet: 3400,
      taxCategory: 'S',
      vatRate: 5,
    },
  ],
  taxBreakdown: [{ taxCategory: 'S', taxableAmount: 15400, vatRate: 5, vatAmount: 770 }],
  totals: { lineNetTotal: 15400, vatTotal: 770, payableTotal: 16170 },
} as const;

export const GAPPY_SAMPLE = {
  seller: {
    name: 'Desert Rose Trading LLC',
    address: 'Office 1204, Marina Plaza, Dubai, UAE',
    trn: '100123456700003',
  },
  buyer: {
    name: 'Northwind Imports GmbH',
    address: 'Hafenstrasse 12, Hamburg, Germany',
  },
  invoice: {
    number: 'INV-2026-0158',
    issueDate: '2026-07-21',
    transactionDate: '2026-07-01',
    currencyCode: 'EUR',
  },
  lines: [
    {
      description: 'Export consignment, dates and spices',
      quantity: 120,
      unitPrice: 42.5,
      lineNet: 5100,
      taxCategory: 'Z',
      vatRate: 0,
    },
  ],
  taxBreakdown: [{ taxCategory: 'Z', taxableAmount: 5100, vatRate: 0, vatAmount: 0 }],
  totals: { lineNetTotal: 5100, vatTotal: 12, payableTotal: 5112 },
} as const;
