import { useMemo } from 'react';

import { useMockStore } from '../../stores';
import type { UseCustomerDisputesResult } from '../../contexts/DataContext/DataContext';

export function useMockCustomerDisputes(): UseCustomerDisputesResult {
  const { data } = useMockStore();

  return useMemo(() => {
    if (!data.activeAccount) {
      return { disputes: [] };
    }

    const customerDisputes = data.disputes
      .filter((d) => d.customerId === data.activeAccount?.address)
      .map((dispute) => {
        const restaurant = data.restaurants.find(
          (r) => r.id === dispute.restaurantId,
        );
        return {
          dispute,
          restaurantName: restaurant?.name ?? 'Unknown Restaurant',
        };
      })
      // Sort by createdAt descending (newest first)
      .sort((a, b) => b.dispute.createdAt - a.dispute.createdAt);

    return { disputes: customerDisputes };
  }, [data.activeAccount, data.disputes, data.restaurants]);
}
