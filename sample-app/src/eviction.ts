/**
 * Eviction / non-renewal logic.
 */

export type EvictionReason = 'sale' | 'owner-use' | 'demolition' | 'major-works';

/**
 * Minimum months of notice, served through a notary public or by registered
 * mail, that a landlord must give to evict on one of the permitted grounds
 * after the lease expires.
 *
 * SEEDED VIOLATION (LAW26-2007/ART-25/2): Article 25(2) (as amended by Law
 * 33/2008) requires twelve (12) months' notice served via notary public or
 * registered mail. This returns 3 months.
 */
export const EVICTION_NOTICE_MONTHS = 3;

/**
 * SEEDED VIOLATION (LAW26-2007/ART-25/2): the article also requires the notice
 * to be served through a notary public or by registered mail. This code does
 * not record or enforce the service method at all.
 */
export function evictionEffectiveDate(noticeServedOn: Date): Date {
  const effective = new Date(noticeServedOn);
  effective.setMonth(effective.getMonth() + EVICTION_NOTICE_MONTHS);
  return effective;
}

export function permittedReasons(): EvictionReason[] {
  return ['sale', 'owner-use', 'demolition', 'major-works'];
}
