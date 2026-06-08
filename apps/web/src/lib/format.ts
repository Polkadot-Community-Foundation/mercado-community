/**
 * pUSD token decimals (Asset Hub standard for stablecoins).
 * Internal prices are stored as cents (2 decimals), but pUSD uses 6.
 */
export const PUSD_DECIMALS = 6;

/**
 * Format a price in cents to a display string.
 * Uses BigInt-safe string formatting to avoid precision loss.
 *
 * @param cents - Price in cents (bigint where 100 = $1.00)
 * @param symbol - Currency symbol to append (default: 'pUSD')
 * @returns Formatted string like "12.50 pUSD"
 */
export function formatPrice(cents: bigint, symbol = 'pUSD'): string {
  return formatBigIntDecimal(cents, 2, 2, symbol);
}

/**
 * Format a raw token amount (with full decimals) to a display string.
 * Uses BigInt-safe string formatting to avoid precision loss with large values.
 *
 * Use this when displaying actual on-chain token balances that use
 * the full decimal precision (e.g., 6 decimals for pUSD).
 *
 * @param amount - Raw token amount as bigint (e.g., 1000000n = 1 pUSD)
 * @param displayDecimals - Number of decimal places to show (default: 2)
 * @param tokenDecimals - Token's decimal precision (default: PUSD_DECIMALS)
 * @param symbol - Currency symbol to append (default: 'pUSD')
 * @returns Formatted string like "12.50 pUSD"
 */
export function formatCurrency(
  amount: string | bigint,
  displayDecimals = 2,
  tokenDecimals = PUSD_DECIMALS,
  symbol = 'pUSD',
): string {
  const amountBigInt = typeof amount === 'string' ? BigInt(amount) : amount;
  return formatBigIntDecimal(
    amountBigInt,
    tokenDecimals,
    displayDecimals,
    symbol,
  );
}

/**
 * BigInt-safe decimal formatting using pure string manipulation.
 * Avoids Number/parseFloat to maintain precision for large values.
 */
function formatBigIntDecimal(
  amount: bigint,
  sourceDecimals: number,
  displayDecimals: number,
  symbol: string,
): string {
  const isNegative = amount < 0n;
  const absAmount = isNegative ? -amount : amount;

  // Use BigInt exponentiation to avoid Number precision issues
  const divisor = 10n ** BigInt(sourceDecimals);
  const wholePart = absAmount / divisor;
  const remainder = absAmount % divisor;

  // Pad remainder to full precision, then truncate/round to displayDecimals
  const remainderStr = remainder.toString().padStart(sourceDecimals, '0');
  const displayRemainder = remainderStr
    .slice(0, displayDecimals)
    .padEnd(displayDecimals, '0');

  // Round if we're truncating (check the next digit)
  let finalWhole = wholePart.toString();
  let finalRemainder = displayRemainder;

  if (
    sourceDecimals > displayDecimals &&
    remainderStr.length > displayDecimals
  ) {
    const nextDigit = parseInt(remainderStr[displayDecimals] || '0', 10);
    if (nextDigit >= 5) {
      // Need to round up - add 1 to the display remainder
      const rounded = BigInt(displayRemainder) + 1n;
      const maxRemainder = 10n ** BigInt(displayDecimals);
      if (rounded >= maxRemainder) {
        // Carry over to whole part
        finalWhole = (wholePart + 1n).toString();
        finalRemainder = '0'.repeat(displayDecimals);
      } else {
        finalRemainder = rounded.toString().padStart(displayDecimals, '0');
      }
    }
  }

  const sign = isNegative ? '-' : '';
  return `${sign}${finalWhole}.${finalRemainder} ${symbol}`;
}

/**
 * Convert cents (2 decimals) to pUSD base units (6 decimals).
 *
 * @param cents - Amount in cents (100 = $1.00)
 * @returns Amount in pUSD base units (1000000 = 1 pUSD)
 */
export function centsToPusdUnits(cents: bigint): bigint {
  // cents has 2 decimals, pUSD has 6, so multiply by 10^4
  return cents * 10000n;
}

/**
 * Convert pUSD base units (6 decimals) to cents (2 decimals).
 *
 * Note: This uses integer division and truncates toward zero.
 * Fractions of a cent are lost (e.g., 10001 pUSD units = 1 cent, not 1.0001).
 *
 * @param pusdUnits - Amount in pUSD base units (1000000 = 1 pUSD)
 * @returns Amount in cents (100 = $1.00), truncated
 */
export function pusdUnitsToCents(pusdUnits: bigint): bigint {
  // pUSD has 6 decimals, cents has 2, so divide by 10^4
  return pusdUnits / 10000n;
}

export function formatOptions(options: { name: string }[]): string | undefined {
  if (options.length === 0) return undefined;
  return `${options.length} option${options.length > 1 ? 's' : ''}: ${options.map((o) => o.name).join(', ')}`;
}
