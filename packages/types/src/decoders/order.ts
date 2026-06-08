import type { OrderStatus } from '../order';
import type { OrderTuple } from '../contract-tuples';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const STATUS_MAP: Record<number, OrderStatus> = {
  0: 'PLACED',
  1: 'CONFIRMED',
  2: 'PREPARING',
  3: 'READY_FOR_PICKUP',
  4: 'COMPLETED',
  5: 'CANCELED',
};

export interface DecodedOrder {
  customer: string;
  restaurantId: string;
  price: bigint;
  status: OrderStatus;
  completedAt: number | undefined;
}

/**
 * Decode an order tuple from MercadoCore.orders().
 * Returns null if the order doesn't exist (zero address customer).
 */
export function decodeOrderTuple(tuple: OrderTuple): DecodedOrder | null {
  const [customer, restaurantId, price, status, completedAt] = tuple;

  if (customer === ZERO_ADDRESS) {
    return null;
  }

  return {
    customer,
    restaurantId: restaurantId.toString(),
    price,
    status: STATUS_MAP[status] ?? 'PLACED',
    completedAt: completedAt > 0n ? Number(completedAt) * 1000 : undefined,
  };
}
