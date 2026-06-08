import { useMemo } from 'react';

import { useMockStore } from '../../stores';
import type { UseRestaurantOrdersResult } from '../../contexts/DataContext/DataContext';

export function useMockRestaurantOrders(): UseRestaurantOrdersResult {
  const { data } = useMockStore();

  const orders = useMemo(() => {
    if (!data.activeAccount) return [];
    const address = data.activeAccount.address;
    const restaurant = data.restaurants.find((r) => r.owner === address);
    if (!restaurant) return [];
    return data.orders.filter((o) => o.restaurantId === restaurant.id);
  }, [data.activeAccount, data.restaurants, data.orders]);

  return { orders };
}
