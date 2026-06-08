import { useMemo } from 'react';

import { useMockStore } from '../../stores';
import type { UseRestaurantsResult } from '../../contexts/DataContext/DataContext';

export function useMockRestaurants(
  location: string,
  category?: string | null,
): UseRestaurantsResult {
  const { data } = useMockStore();
  return useMemo(
    () => ({
      restaurants: data.restaurants.filter((r) => {
        // Filter by location
        if (r.location.toLowerCase() !== location.toLowerCase()) return false;
        // Filter by category if provided
        if (category && r.category !== category) return false;
        return true;
      }),
    }),
    [data.restaurants, location, category],
  );
}
