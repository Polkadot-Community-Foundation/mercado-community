/**
 * Menu data serialization/deserialization helpers.
 *
 * Menus are stored as JSON which loses BigInt precision.
 * These helpers ensure prices are properly converted to/from bigint.
 */
import type { Dish, DishOption } from '@mercado/types';

/** Raw menu data as stored in JSON (prices as strings or numbers) */
interface RawDish {
  id: string;
  name: string;
  description: string;
  basePrice: string | number | bigint;
  inStock: boolean;
  photoUrl?: string;
  options: Array<{
    id: string;
    name: string;
    price: string | number | bigint;
  }>;
}

/**
 * Convert a raw price value to bigint cents.
 * Handles strings, numbers, and already-bigint values.
 */
function toBigIntCents(value: string | number | bigint): bigint {
  if (typeof value === 'bigint') {
    return value;
  }

  if (typeof value === 'string') {
    // Check if it's a decimal string (e.g., "12.50")
    if (value.includes('.')) {
      const [whole, decimal = ''] = value.split('.');
      const paddedDecimal = decimal.padEnd(2, '0').slice(0, 2);
      return BigInt(whole + paddedDecimal);
    }
    // Otherwise treat as cents directly
    return BigInt(value);
  }

  // Number - assume it's in cents
  return BigInt(Math.round(value));
}

/**
 * Convert a raw price that was scaled to 1e18 back to cents.
 * Menu editor scales prices to 1e18 for contract compatibility.
 */
function fromWeiToCents(value: string | number | bigint): bigint {
  const wei = typeof value === 'bigint' ? value : BigInt(value.toString());
  // 1e18 wei = 1 unit, we want cents (1/100 unit)
  // So divide by 1e16 to get cents
  return wei / 10n ** 16n;
}

/**
 * Hydrate raw menu JSON data into typed Dish array with bigint prices.
 * Detects whether prices are in cents or wei format.
 */
export function hydrateMenu(rawDishes: RawDish[]): Dish[] {
  return rawDishes.map((raw) => {
    // Detect if price is in wei (very large number) or cents
    const rawPrice =
      typeof raw.basePrice === 'string'
        ? BigInt(raw.basePrice.split('.')[0] || '0')
        : BigInt(raw.basePrice.toString());

    // If price > 1e10, assume it's in wei format and convert
    const isWeiFormat = rawPrice > 10_000_000_000n;
    const basePrice = isWeiFormat
      ? fromWeiToCents(raw.basePrice)
      : toBigIntCents(raw.basePrice);

    const options: DishOption[] = raw.options.map((opt) => {
      const rawOptPrice =
        typeof opt.price === 'string'
          ? BigInt(opt.price.split('.')[0] || '0')
          : BigInt(opt.price.toString());

      const optIsWei = rawOptPrice > 10_000_000_000n;
      return {
        id: opt.id,
        name: opt.name,
        price: optIsWei ? fromWeiToCents(opt.price) : toBigIntCents(opt.price),
      };
    });

    return {
      id: raw.id,
      name: raw.name,
      description: raw.description,
      basePrice,
      inStock: raw.inStock,
      photoUrl: raw.photoUrl,
      options,
    };
  });
}

/**
 * Serialize dishes for JSON storage.
 * Converts bigint prices to strings.
 */
export function serializeMenu(dishes: Dish[]): Array<
  Omit<Dish, 'basePrice' | 'options'> & {
    basePrice: string;
    options: Array<Omit<DishOption, 'price'> & { price: string }>;
  }
> {
  return dishes.map((dish) => ({
    ...dish,
    basePrice: dish.basePrice.toString(),
    options: dish.options.map((opt) => ({
      ...opt,
      price: opt.price.toString(),
    })),
  }));
}
