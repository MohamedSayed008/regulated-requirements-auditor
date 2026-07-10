/**
 * Rent-increase logic. Under Decree No. (43) of 2013 the maximum increase at
 * renewal is a slab based on how far the current rent sits below the average
 * rental value of comparable units.
 */

export interface RentReview {
  currentAnnualRent: number;
  marketAverageRent: number;
}

/**
 * Returns the maximum permitted rent increase as a fraction (0.0 - 0.20).
 *
 * SEEDED VIOLATION (DEC43-2013/ART-1): the slab thresholds and percentages
 * here do not match the decree. The decree is: 0% when rent is < 10% below
 * market; 5% when 11-20% below; 10% when 21-30% below; 15% when 31-40% below;
 * 20% when more than 40% below. This implementation uses wrong bands (starts
 * increasing too early and caps at 25%).
 */
export function maxIncreaseFraction(review: RentReview): number {
  const shortfall =
    (review.marketAverageRent - review.currentAnnualRent) / review.marketAverageRent;
  if (shortfall <= 0.05) return 0;
  if (shortfall <= 0.15) return 0.05;
  if (shortfall <= 0.25) return 0.1;
  if (shortfall <= 0.35) return 0.15;
  return 0.25;
}

export function proposedNewRent(review: RentReview, requestedRent: number): number {
  const cap = review.currentAnnualRent * (1 + maxIncreaseFraction(review));
  return Math.min(requestedRent, cap);
}
