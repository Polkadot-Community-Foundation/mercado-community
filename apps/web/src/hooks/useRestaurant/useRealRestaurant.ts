import { useState, useEffect, useCallback } from 'react';
import type {
  Restaurant,
  Dish,
  RestaurantCoreTuple,
  RestaurantMetaTuple,
  RatingTuple,
} from '@mercado/types';
import {
  decodeRestaurantCoreTuple,
  decodeRestaurantMetaTuple,
  decodeRatingTuple,
} from '@mercado/types';

import { useContracts } from '../../contexts/ContractsContext';
import type { UseRestaurantResult } from '../../contexts/DataContext/DataContext';
import { hydrateMenu } from '../../lib/menuHelpers';
import { IPFS_GATEWAY_FOR_DISPLAY } from '../../lib/bulletinConfig';

/**
 * Fetch menu (dishes) from IPFS gateway and hydrate bigint prices.
 */
async function fetchMenuFromIPFS(menuCID: string): Promise<Dish[]> {
  if (!menuCID) {
    return [];
  }

  try {
    const response = await fetch(`${IPFS_GATEWAY_FOR_DISPLAY}${menuCID}`);
    if (!response.ok) {
      throw new Error('Failed to fetch menu');
    }
    const data = await response.json();
    const rawDishes = data.dishes || data.items || [];
    // Hydrate prices from JSON strings to bigint
    return hydrateMenu(rawDishes);
  } catch (err) {
    console.warn('Failed to fetch menu from IPFS:', err);
    return [];
  }
}

/**
 * Real implementation of restaurant fetching from MercadoCore + RestaurantMeta contracts.
 */
export function useRealRestaurant(restaurantId: string): UseRestaurantResult {
  const { core, restaurantMeta, ratings, isConnected } = useContracts();
  const [restaurant, setRestaurant] = useState<Restaurant | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState(true);

  const fetchRestaurant = useCallback(async () => {
    if (!core || !isConnected || !restaurantId) {
      setRestaurant(undefined);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Fetch core restaurant data
      const coreResult = (await core.read('restaurants', [
        BigInt(restaurantId),
      ])) as RestaurantCoreTuple;
      const coreDecoded = decodeRestaurantCoreTuple(coreResult);

      if (!coreDecoded) {
        setRestaurant(undefined);
        return;
      }

      // Fetch metadata (description, avatar, menu CID, category)
      let meta = decodeRestaurantMetaTuple(['', '', '', 'burgers', 0n]);
      if (restaurantMeta) {
        try {
          const metaResult = (await restaurantMeta.read('getMetadata', [
            BigInt(restaurantId),
          ])) as RestaurantMetaTuple;
          meta = decodeRestaurantMetaTuple(metaResult);
        } catch {
          // Metadata not set, use defaults
        }
      }

      // Fetch menu (dishes) from IPFS if CID is set
      const dishes = await fetchMenuFromIPFS(meta.menuCID);

      // Fetch rating
      let rating = { ratingSum: 0, ratingCount: 0 };
      if (ratings) {
        try {
          const ratingResult = (await ratings.read('getAverage', [
            BigInt(restaurantId),
          ])) as RatingTuple;
          rating = decodeRatingTuple(ratingResult);
        } catch {
          // No ratings yet
        }
      }

      // Avatar URL may be a full URL (from Bulletin upload) or just a CID
      let avatarUrl: string | undefined;
      if (meta.avatarUrl) {
        avatarUrl = meta.avatarUrl.startsWith('http')
          ? meta.avatarUrl
          : `${IPFS_GATEWAY_FOR_DISPLAY}${meta.avatarUrl}`;
      }

      setRestaurant({
        id: restaurantId,
        owner: coreDecoded.owner,
        name: coreDecoded.name,
        description: meta.description,
        location: coreDecoded.location,
        category: meta.category,
        isOpen: coreDecoded.isOpen,
        avatarUrl,
        ratingSum: rating.ratingSum,
        ratingCount: rating.ratingCount,
        dishes,
      });
    } catch (err) {
      console.error('Failed to fetch restaurant:', err);
      setRestaurant(undefined);
    } finally {
      setIsLoading(false);
    }
  }, [core, restaurantMeta, ratings, isConnected, restaurantId]);

  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  return { restaurant, isLoading };
}
