import { useCallback } from 'react';

import { useMockStore } from '../../stores';
import type { UseCancelOrderResult } from '../../contexts/DataContext/DataContext';

export function useMockCancelOrder(): UseCancelOrderResult {
  const { data, setData } = useMockStore();

  const cancel = useCallback(
    async (orderId: string, onSuccess?: () => void): Promise<void> => {
      if (!data.activeAccount) return;
      const address = data.activeAccount.address;
      const isRestaurant = data.restaurants.some((r) => r.owner === address);
      const canceledBy = isRestaurant ? 'restaurant' : 'customer';

      setData((prev) => ({
        ...prev,
        orders: prev.orders.map((o) => {
          if (o.id !== orderId) return o;
          if (o.status === 'COMPLETED' || o.status === 'CANCELED') return o;
          return { ...o, status: 'CANCELED' as const, canceledBy };
        }),
      }));
      onSuccess?.();
    },
    [data.activeAccount, data.restaurants, setData],
  );

  return { cancel };
}
