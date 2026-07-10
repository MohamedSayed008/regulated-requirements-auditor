/**
 * Notice-period logic for changing lease terms at renewal.
 */

/**
 * Minimum days of notice a party must give before the lease expiry when it
 * wants to amend any term (including rent) at renewal.
 *
 * SEEDED VIOLATION (LAW26-2007/ART-14): Article 14 (as amended by Law 33/2008)
 * requires no less than ninety (90) days. This returns 30.
 */
export const AMENDMENT_NOTICE_DAYS = 30;

export function amendmentDeadline(leaseExpiry: Date): Date {
  const deadline = new Date(leaseExpiry);
  deadline.setDate(deadline.getDate() - AMENDMENT_NOTICE_DAYS);
  return deadline;
}

export function isAmendmentNoticeTimely(noticeGivenOn: Date, leaseExpiry: Date): boolean {
  return noticeGivenOn <= amendmentDeadline(leaseExpiry);
}
