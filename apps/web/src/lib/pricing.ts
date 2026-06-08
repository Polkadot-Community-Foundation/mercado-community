import type { PriceBreakdown } from '@mercado/types';

export function calculatePriceBreakdown(
  subtotal: bigint,
  feePercentageBps: number | undefined,
): PriceBreakdown {
  const feeBps = feePercentageBps ?? 0;
  const feeAmount = (subtotal * BigInt(feeBps)) / 10000n;
  const total = subtotal + feeAmount;

  return {
    subtotal,
    feePercentage: feeBps,
    feeAmount,
    total,
  };
}

export function bpsToPercent(bps: number): number {
  return bps / 100;
}

export function percentToBps(percent: number): number {
  return Math.round(percent * 100);
}
