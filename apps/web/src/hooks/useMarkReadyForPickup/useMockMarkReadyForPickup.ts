import { useCallback, useRef } from 'react';

import { useMockStore } from '../../stores';
import type {
  UseMarkReadyForPickupResult,
  MarkReadyResult,
} from '../../contexts/DataContext/DataContext';
import { generatePickupCode } from '../../lib/pickupCode';

/**
 * Mock implementation of marking an order ready for pickup.
 *
 * Uses a ref to access latest state to avoid stale closure issues.
 */
export function useMockMarkReadyForPickup(): UseMarkReadyForPickupResult {
  const { data, setData } = useMockStore();

  // Use a ref to always have access to the latest orders
  const ordersRef = useRef(data.orders);
  ordersRef.current = data.orders;

  const markReady = useCallback(
    async (
      orderId: string,
      onSuccess?: (result: MarkReadyResult) => void,
    ): Promise<MarkReadyResult> => {
      // Read fresh state from ref
      const order = ordersRef.current.find((o) => o.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      if (order.status !== 'PREPARING') {
        throw new Error(
          `Order is not in PREPARING status (current: ${order.status})`,
        );
      }

      // Generate pickup code
      const { displayCode, secret, hash } = generatePickupCode(orderId);

      // Update mock order
      setData((prev) => ({
        ...prev,
        orders: prev.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: 'READY_FOR_PICKUP' as const,
                pickupCodeHash: hash,
              }
            : o,
        ),
      }));

      const result: MarkReadyResult = { displayCode, secret };
      onSuccess?.(result);
      return result;
    },
    [setData],
  );

  return { markReady };
}
