import { describe, it, expect } from 'vitest';

import { calculatePriceBreakdown, bpsToPercent, percentToBps } from './pricing';

describe('calculatePriceBreakdown', () => {
  it('returns zero fee when feePercentage is undefined', () => {
    const result = calculatePriceBreakdown(1000n, undefined);
    expect(result.subtotal).toBe(1000n);
    expect(result.feePercentage).toBe(0);
    expect(result.feeAmount).toBe(0n);
    expect(result.total).toBe(1000n);
  });

  it('returns zero fee when feePercentage is 0', () => {
    const result = calculatePriceBreakdown(1000n, 0);
    expect(result.subtotal).toBe(1000n);
    expect(result.feePercentage).toBe(0);
    expect(result.feeAmount).toBe(0n);
    expect(result.total).toBe(1000n);
  });

  it('calculates 5% fee correctly (500 bps)', () => {
    const result = calculatePriceBreakdown(10000n, 500);
    expect(result.subtotal).toBe(10000n);
    expect(result.feePercentage).toBe(500);
    expect(result.feeAmount).toBe(500n); // 10000 * 500 / 10000 = 500
    expect(result.total).toBe(10500n);
  });

  it('calculates max fee 10% correctly (1000 bps)', () => {
    const result = calculatePriceBreakdown(10000n, 1000);
    expect(result.subtotal).toBe(10000n);
    expect(result.feePercentage).toBe(1000);
    expect(result.feeAmount).toBe(1000n);
    expect(result.total).toBe(11000n);
  });

  it('truncates fractional amounts (no rounding up)', () => {
    // 33n * 500 / 10000 = 16500 / 10000 = 1.65 → truncates to 1n
    const result = calculatePriceBreakdown(33n, 500);
    expect(result.feeAmount).toBe(1n);
    expect(result.total).toBe(34n);
  });

  it('handles large values correctly', () => {
    const largeSubtotal = 1_000_000_000_000_000n; // 1 quadrillion
    const result = calculatePriceBreakdown(largeSubtotal, 500);
    expect(result.feeAmount).toBe(50_000_000_000_000n);
    expect(result.total).toBe(1_050_000_000_000_000n);
  });

  it('handles 1 basis point (0.01%)', () => {
    const result = calculatePriceBreakdown(100000n, 1);
    expect(result.feeAmount).toBe(10n); // 100000 * 1 / 10000 = 10
    expect(result.total).toBe(100010n);
  });
});

describe('bpsToPercent', () => {
  it('converts 100 bps to 1%', () => {
    expect(bpsToPercent(100)).toBe(1);
  });

  it('converts 500 bps to 5%', () => {
    expect(bpsToPercent(500)).toBe(5);
  });

  it('converts 1000 bps to 10%', () => {
    expect(bpsToPercent(1000)).toBe(10);
  });

  it('converts 50 bps to 0.5%', () => {
    expect(bpsToPercent(50)).toBe(0.5);
  });

  it('converts 0 bps to 0%', () => {
    expect(bpsToPercent(0)).toBe(0);
  });
});

describe('percentToBps', () => {
  it('converts 1% to 100 bps', () => {
    expect(percentToBps(1)).toBe(100);
  });

  it('converts 5% to 500 bps', () => {
    expect(percentToBps(5)).toBe(500);
  });

  it('converts 10% to 1000 bps', () => {
    expect(percentToBps(10)).toBe(1000);
  });

  it('converts 0.5% to 50 bps', () => {
    expect(percentToBps(0.5)).toBe(50);
  });

  it('converts 0% to 0 bps', () => {
    expect(percentToBps(0)).toBe(0);
  });

  it('rounds to nearest integer for fractional bps', () => {
    expect(percentToBps(0.33)).toBe(33);
    expect(percentToBps(0.335)).toBe(34); // rounds up
  });
});
