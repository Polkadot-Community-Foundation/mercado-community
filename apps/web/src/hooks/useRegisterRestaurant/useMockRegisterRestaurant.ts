import { useCallback } from 'react';
import type { Restaurant } from '@mercado/types';

import { useMockStore } from '../../stores';
import type {
  UseRegisterRestaurantResult,
  RegisterRestaurantInput,
} from '../../contexts/DataContext/DataContext';

export function useMockRegisterRestaurant(): UseRegisterRestaurantResult {
  const { data, setData } = useMockStore();

  const register = useCallback(
    (input: RegisterRestaurantInput) => {
      if (!data.activeAccount) {
        throw new Error('Cannot register restaurant without an account');
      }

      // Check if user already owns a restaurant
      const existingRestaurant = data.restaurants.find(
        (r) => r.owner === data.activeAccount?.address,
      );
      if (existingRestaurant) {
        throw new Error('Account already owns a restaurant');
      }

      // Validate required fields
      if (!input.name || input.name.trim().length < 3) {
        throw new Error('Restaurant name must be at least 3 characters');
      }
      if (!input.location) {
        throw new Error('Location is required');
      }
      if (!input.description) {
        throw new Error('Description is required');
      }

      const id = crypto.randomUUID();
      const restaurant: Restaurant = {
        id,
        owner: data.activeAccount.address,
        name: input.name.trim(),
        description: input.description.trim(),
        location: input.location,
        category: 'italian', // Default category for new restaurants
        isOpen: true,
        ratingSum: 0,
        ratingCount: 0,
        deliveryTime: '25-40 min',
        avatarUrl: input.avatarUrl,
        dishes: [],
      };

      // Add the restaurant - useAccountInfo will automatically derive restaurantId
      // from the restaurant's owner field
      setData((prev) => ({
        ...prev,
        restaurants: [...prev.restaurants, restaurant],
      }));

      return id;
    },
    [data.activeAccount, data.restaurants, setData],
  );

  return { register };
}
