import { useState } from 'react';
import { useParams } from 'react-router';

import { useRestaurant, useCart } from '../hooks';
import { RestaurantDetail, LoadingSpinner } from '../components';
import type { Dish } from '../types';

import { DishOptionModalContainer } from './DishOptionModalContainer';

export function RestaurantDetailContainer() {
  const { id } = useParams<{ id: string }>();
  const { restaurant, isLoading } = useRestaurant(id ?? '');
  const { cartItemCount, cart } = useCart();
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <LoadingSpinner />
        <p className="mt-2 text-text-secondary">Loading restaurant...</p>
      </div>
    );
  }

  if (!restaurant) {
    return <p className="text-text-secondary">Restaurant not found.</p>;
  }

  const showCheckout = cartItemCount > 0 && cart.restaurantId === restaurant.id;

  return (
    <RestaurantDetail
      restaurant={restaurant}
      showCheckout={showCheckout}
      cartItemCount={cartItemCount}
      onDishClick={(dish) => setSelectedDish(dish)}
    >
      <DishOptionModalContainer
        dish={selectedDish}
        restaurantId={restaurant.id}
        onClose={() => setSelectedDish(null)}
      />
    </RestaurantDetail>
  );
}
