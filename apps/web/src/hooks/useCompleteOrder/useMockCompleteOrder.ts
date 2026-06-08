import { useCallback } from 'react';

import { useMockStore } from '../../stores';
import type { UseCompleteOrderResult } from '../../contexts/DataContext/DataContext';
import { verifyPickupCode, hasPickupCode } from '../../lib/pickupCode';

/**
 * Mock implementation of order completion with pickup code verification.
 *
 * Verifies the display code against the stored hash before completing.
 */
export function useMockCompleteOrder(): UseCompleteOrderResult {
  const { data, setData } = useMockStore();

  const complete = useCallback(
    async (
      orderId: string,
      displayCode: string,
      onSuccess?: () => void,
    ): Promise<void> => {
      const order = data.orders.find((o) => o.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      if (order.status !== 'READY_FOR_PICKUP') {
        throw new Error('Order is not ready for pickup');
      }

      // Verify pickup code if one was set
      if (hasPickupCode(order.pickupCodeHash)) {
        const isValid = verifyPickupCode(
          orderId,
          displayCode,
          order.pickupCodeHash!,
        );
        if (!isValid) {
          throw new Error('Invalid pickup code');
        }
      }

      // Update mock order to completed
      setData((prev) => ({
        ...prev,
        orders: prev.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: 'COMPLETED' as const,
                completedAt: Date.now(),
              }
            : o,
        ),
      }));

      onSuccess?.();
    },
    [data.orders, setData],
  );

  return { complete };
}
