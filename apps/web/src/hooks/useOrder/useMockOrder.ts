import { useMemo } from 'react';

import { useMockStore } from '../../stores';
import type { UseOrderResult } from '../../contexts/DataContext/DataContext';

export function useMockOrder(orderId: string): UseOrderResult {
  const { data } = useMockStore();
  return useMemo(
    () => ({
      order: data.orders.find((o) => o.id === orderId),
    }),
    [data.orders, orderId],
  );
}
