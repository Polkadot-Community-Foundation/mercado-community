import { useCallback } from 'react';
import { useAuth } from '@mercado/core-hooks';

import { useContracts } from '../../contexts/ContractsContext';
import type { UseRateRestaurantResult } from '../../contexts/DataContext/DataContext';
import { signAndSubmitWithTimeout } from '../../lib/contracts';

/**
 * Real implementation of restaurant rating using MercadoRatings contract.
 */
export function useRealRateRestaurant(): UseRateRestaurantResult {
  const { ratings, isConnected } = useContracts();
  const { account, signer } = useAuth();

  const rateRestaurant = useCallback(
    async (orderId: string, rating: number, onSuccess?: () => void) => {
      if (!ratings || !isConnected) {
        throw new Error('Contracts not connected');
      }
      if (!account || !signer) {
        throw new Error('Not signed in');
      }
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      // Dry-run the transaction
      const result = await ratings.write(
        'rate',
        [BigInt(orderId), rating],
        account.address,
      );

      // Submit the transaction
      const tx = result.send();
      await signAndSubmitWithTimeout(tx, signer);

      onSuccess?.();
    },
    [ratings, isConnected, account, signer],
  );

  return { rateRestaurant };
}

/**
 * Hook to get average rating for a restaurant.
 */
export function useRestaurantRating(restaurantId: string) {
  const { ratings, isConnected } = useContracts();

  const getAverage = useCallback(async () => {
    if (!ratings || !isConnected) {
      return { average: 0, count: 0 };
    }

    try {
      const result = (await ratings.read('getAverage', [
        BigInt(restaurantId),
      ])) as [bigint, bigint];
      return {
        average: Number(result[0]) / 100, // Contract returns avg * 100
        count: Number(result[1]),
      };
    } catch {
      return { average: 0, count: 0 };
    }
  }, [ratings, isConnected, restaurantId]);

  return { getAverage };
}
