import { useMemo } from 'react';

import { useMockStore } from '../../stores';
import type { UseRestaurantResult } from '../../contexts/DataContext/DataContext';

export function useMockRestaurant(id: string): UseRestaurantResult {
  const { data } = useMockStore();
  return useMemo(
    () => ({
      restaurant: data.restaurants.find((r) => r.id === id),
    }),
    [data.restaurants, id],
  );
}
