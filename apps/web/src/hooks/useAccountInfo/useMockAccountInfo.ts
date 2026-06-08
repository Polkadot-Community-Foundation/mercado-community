import { useMemo } from 'react';

import { useMockStore } from '../../stores';
import type { UseAccountInfoResult } from '../../contexts/DataContext/DataContext';

export function useMockAccountInfo(): UseAccountInfoResult {
  const { data } = useMockStore();

  const restaurantId = useMemo(() => {
    if (!data.activeAccount) return null;
    const address = data.activeAccount.address;
    const restaurant = data.restaurants.find((r) => r.owner === address);
    return restaurant?.id ?? null;
  }, [data.activeAccount, data.restaurants]);

  return useMemo(
    () => ({
      account: data.activeAccount,
      restaurantId,
      signer: null, // Mock doesn't provide real signer
      isLoading: false,
    }),
    [data.activeAccount, restaurantId],
  );
}
