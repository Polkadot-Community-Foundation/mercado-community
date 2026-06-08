/**
 * Calculate average rating from sum and count.
 * Returns a decimal rating (e.g., 4.7) or 0 if no ratings.
 */
export function calculateRating(
  ratingSum: number,
  ratingCount: number,
): number {
  if (ratingCount === 0) return 0;
  // Round to one decimal place
  return Math.round((ratingSum / ratingCount) * 10) / 10;
}
