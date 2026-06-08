// 24 hours in milliseconds
export const DISPUTE_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Check if the dispute window is still open for an order.
 * Uses inclusive boundary: window closes at exactly 24 hours.
 * Matches contract: block.timestamp <= order.completedAt + DISPUTE_WINDOW
 */
export function isDisputeWindowOpen(completedAt: number | undefined): boolean {
  if (!completedAt) return false;
  const elapsed = Date.now() - completedAt;
  return elapsed <= DISPUTE_WINDOW_MS;
}
