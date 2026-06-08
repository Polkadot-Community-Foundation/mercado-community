import { useState, useEffect, useCallback } from 'react';
import type {
  Restaurant,
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
import type { UseRestaurantsResult } from '../../contexts/DataContext/DataContext';
import { RESTAURANT_SCAN_LIMIT } from '../../lib/constants';
import { IPFS_GATEWAY_FOR_DISPLAY } from '../../lib/bulletinConfig';

/**
 * Real implementation of restaurants listing by scanning MercadoCore contract.
 *
 * This approach reads nextRestaurantId and then fetches each restaurant by ID.
 * Works well for small numbers of restaurants (testnet/demo).
 * For production, use an indexer.
 */
export function useRealRestaurants(
  location: string,
  category?: string | null,
): UseRestaurantsResult {
  const { core, restaurantMeta, ratings, isConnected } = useContracts();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSingleRestaurant = useCallback(
    async (id: number): Promise<Restaurant | null> => {
      if (!core) return null;

      try {
        const coreResult = (await core.read('restaurants', [
          BigInt(id),
        ])) as RestaurantCoreTuple;
        const coreDecoded = decodeRestaurantCoreTuple(coreResult);

        // Skip if restaurant doesn't exist or is closed
        if (!coreDecoded || !coreDecoded.isOpen) {
          return null;
        }

        // Fetch metadata (description, avatar, menu CID, category)
        let meta = decodeRestaurantMetaTuple(['', '', '', 'burgers', 0n]);
        if (restaurantMeta) {
          try {
            const metaResult = (await restaurantMeta.read('getMetadata', [
              BigInt(id),
            ])) as RestaurantMetaTuple;
            meta = decodeRestaurantMetaTuple(metaResult);
          } catch {
            // Metadata not set
          }
        }

        // Fetch rating
        let rating = { ratingSum: 0, ratingCount: 0 };
        if (ratings) {
          try {
            const ratingResult = (await ratings.read('getAverage', [
              BigInt(id),
            ])) as RatingTuple;
            rating = decodeRatingTuple(ratingResult);
          } catch {
            // No ratings
          }
        }

        // Avatar URL may be a full URL (from Bulletin upload) or just a CID
        let avatarUrl: string | undefined;
        if (meta.avatarUrl) {
          avatarUrl = meta.avatarUrl.startsWith('http')
            ? meta.avatarUrl
            : `${IPFS_GATEWAY_FOR_DISPLAY}${meta.avatarUrl}`;
        }

        return {
          id: id.toString(),
          owner: coreDecoded.owner,
          name: coreDecoded.name,
          description: meta.description,
          location: coreDecoded.location,
          category: meta.category,
          isOpen: coreDecoded.isOpen,
          avatarUrl,
          ratingSum: rating.ratingSum,
          ratingCount: rating.ratingCount,
          dishes: [], // Not loaded in list view
        };
      } catch {
        return null;
      }
    },
    [core, restaurantMeta, ratings],
  );

  const fetchRestaurants = useCallback(async () => {
    if (!core || !isConnected) {
      setRestaurants([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Get total number of restaurants
      const nextId = (await core.read<bigint>('nextRestaurantId')) || 1n;
      const total = Number(nextId) - 1;

      if (total === 0) {
        setRestaurants([]);
        return;
      }

      // Fetch all restaurants (limit for performance)
      const maxToFetch = Math.min(total, RESTAURANT_SCAN_LIMIT);
      const restaurantPromises: Promise<Restaurant | null>[] = [];

      for (let i = 1; i <= maxToFetch; i++) {
        restaurantPromises.push(fetchSingleRestaurant(i));
      }

      const results = await Promise.all(restaurantPromises);
      let validRestaurants = results.filter((r): r is Restaurant => r !== null);

      // Filter by location if specified
      if (location) {
        validRestaurants = validRestaurants.filter(
          (r) =>
            r.location.toLowerCase().includes(location.toLowerCase()) ||
            location.toLowerCase().includes(r.location.toLowerCase()),
        );
      }

      // Filter by category if specified
      if (category) {
        validRestaurants = validRestaurants.filter(
          (r) => r.category === category,
        );
      }

      // Sort by average rating (highest first)
      validRestaurants.sort((a, b) => {
        const avgA = a.ratingCount > 0 ? a.ratingSum / a.ratingCount : 0;
        const avgB = b.ratingCount > 0 ? b.ratingSum / b.ratingCount : 0;
        return avgB - avgA;
      });

      setRestaurants(validRestaurants);
    } catch (err) {
      console.error('Failed to fetch restaurants:', err);
      setRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  }, [core, isConnected, location, category, fetchSingleRestaurant]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  return { restaurants, isLoading };
}
