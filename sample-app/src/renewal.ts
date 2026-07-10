/**
 * Automatic renewal. Correct implementation, included to measure precision:
 * the auditor must NOT raise a finding here.
 */

import { AMENDMENT_NOTICE_DAYS } from './notice';

export interface Tenancy {
  leaseId: string;
  expiry: Date;
  termMonths: number;
}

/**
 * Under Article 6, if the tenancy expires and the tenant stays on with the
 * landlord's knowledge and no objection, the contract renews for the same term
 * (or one year, whichever is shorter) on the same conditions. This models that
 * default renewal.
 */
export function renewOnSameTerms(tenancy: Tenancy): Tenancy {
  const nextExpiry = new Date(tenancy.expiry);
  const renewalMonths = Math.min(tenancy.termMonths, 12);
  nextExpiry.setMonth(nextExpiry.getMonth() + renewalMonths);
  return { ...tenancy, expiry: nextExpiry, termMonths: renewalMonths };
}

export function daysUntilAmendmentDeadline(tenancy: Tenancy, today: Date): number {
  const deadline = new Date(tenancy.expiry);
  deadline.setDate(deadline.getDate() - AMENDMENT_NOTICE_DAYS);
  const ms = deadline.getTime() - today.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
