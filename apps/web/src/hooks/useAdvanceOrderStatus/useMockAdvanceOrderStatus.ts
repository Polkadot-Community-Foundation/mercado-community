import { useCallback } from 'react';
import type { OrderStatus } from '@mercado/types';

import { useMockStore } from '../../stores';
import type { UseAdvanceOrderStatusResult } from '../../contexts/DataContext/DataContext';

const STATUS_PROGRESSION: OrderStatus[] = [
  'PLACED',
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'COMPLETED',
];

export function useMockAdvanceOrderStatus(): UseAdvanceOrderStatusResult {
  const { setData } = useMockStore();

  const advance = useCallback(
    async (orderId: string, onSuccess?: () => void): Promise<void> => {
      setData((prev) => ({
        ...prev,
        orders: prev.orders.map((o) => {
          if (o.id !== orderId) return o;
          const idx = STATUS_PROGRESSION.indexOf(o.status);
          if (idx < 0 || idx >= STATUS_PROGRESSION.length - 1) return o;
          const nextStatus = STATUS_PROGRESSION[idx + 1];
          return {
            ...o,
            status: nextStatus,
            // Set completedAt when advancing to COMPLETED
            ...(nextStatus === 'COMPLETED' && { completedAt: Date.now() }),
          };
        }),
      }));
      onSuccess?.();
    },
    [setData],
  );

  return { advance };
}
