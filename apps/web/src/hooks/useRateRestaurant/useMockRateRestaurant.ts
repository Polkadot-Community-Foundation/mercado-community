import { useCallback } from 'react';

import { useMockStore } from '../../stores';
import type { UseRateRestaurantResult } from '../../contexts/DataContext/DataContext';

export function useMockRateRestaurant(): UseRateRestaurantResult {
  const { data, setData } = useMockStore();

  const rateRestaurant = useCallback(
    async (
      orderId: string,
      rating: number,
      onSuccess?: () => void,
    ): Promise<void> => {
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      // Authorization: must be logged in
      if (!data.activeAccount) {
        throw new Error('Must be logged in to rate');
      }

      setData((prev) => {
        // Find the order
        const order = prev.orders.find((o) => o.id === orderId);
        if (!order) {
          throw new Error('Order not found');
        }

        // Authorization: must own the order
        if (order.customerId !== prev.activeAccount?.address) {
          throw new Error('Can only rate your own orders');
        }

        if (order.status !== 'COMPLETED') {
          throw new Error('Can only rate completed orders');
        }
        if (order.restaurantRating !== undefined) {
          throw new Error('Order already rated');
        }

        // Find the restaurant
        const restaurantIndex = prev.restaurants.findIndex(
          (r) => r.id === order.restaurantId,
        );
        if (restaurantIndex === -1) {
          throw new Error('Restaurant not found');
        }

        // Update order with rating
        const updatedOrders = prev.orders.map((o) =>
          o.id === orderId ? { ...o, restaurantRating: rating } : o,
        );

        // Update restaurant rating aggregates
        const restaurant = prev.restaurants[restaurantIndex];
        const updatedRestaurants = [...prev.restaurants];
        updatedRestaurants[restaurantIndex] = {
          ...restaurant,
          ratingSum: restaurant.ratingSum + rating,
          ratingCount: restaurant.ratingCount + 1,
        };

        return {
          ...prev,
          orders: updatedOrders,
          restaurants: updatedRestaurants,
        };
      });
      onSuccess?.();
    },
    [data.activeAccount, setData],
  );

  return { rateRestaurant };
}
