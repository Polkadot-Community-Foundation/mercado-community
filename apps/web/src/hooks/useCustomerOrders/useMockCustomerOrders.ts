import { useMemo } from 'react';

import { useMockStore } from '../../stores';
import type { UseCustomerOrdersResult } from '../../contexts/DataContext/DataContext';

export function useMockCustomerOrders(): UseCustomerOrdersResult {
  const { data } = useMockStore();

  const orders = useMemo(() => {
    if (!data.activeAccount) return [];
    const address = data.activeAccount.address;
    return data.orders
      .filter((o) => o.customerId === address)
      .map((order) => {
        const restaurant = data.restaurants.find(
          (r) => r.id === order.restaurantId,
        );
        return {
          order,
          restaurantName: restaurant?.name ?? 'Unknown restaurant',
        };
      });
  }, [data.activeAccount, data.orders, data.restaurants]);

  return { orders };
}
