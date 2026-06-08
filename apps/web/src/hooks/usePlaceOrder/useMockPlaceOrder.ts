import { useCallback } from 'react';
import type { Order } from '@mercado/types';

import { useMockStore } from '../../stores';
import type { UsePlaceOrderResult } from '../../contexts/DataContext/DataContext';

export function useMockPlaceOrder(): UsePlaceOrderResult {
  const { data, setData } = useMockStore();

  const placeOrder = useCallback(
    (
      restaurantId: string,
      items: Order['items'],
      totalPrice: bigint,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _matchmakerId?: string,
    ) => {
      if (!data.activeAccount) {
        throw new Error('Cannot place order without an account');
      }
      const id = crypto.randomUUID();
      const order: Order = {
        id,
        customerId: data.activeAccount.address,
        restaurantId,
        items,
        totalPrice,
        status: 'PLACED',
        createdAt: Date.now(),
      };
      setData((prev) => ({ ...prev, orders: [...prev.orders, order] }));
      return id;
    },
    [data.activeAccount, setData],
  );

  return { placeOrder };
}
