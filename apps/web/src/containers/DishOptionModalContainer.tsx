import { useRef } from 'react';

import type { Dish, DishOption } from '../types';
import { DishOptionModal } from '../components';
import { useCart, useAccountInfo } from '../hooks';

type DishOptionModalContainerProps = {
  dish: Dish | null;
  restaurantId: string;
  onClose: () => void;
};

export function DishOptionModalContainer({
  dish,
  restaurantId,
  onClose,
}: DishOptionModalContainerProps) {
  const { addItem } = useCart();
  const { account } = useAccountInfo();
  const lastDishRef = useRef<Dish | null>(null);

  if (dish) {
    lastDishRef.current = dish;
  }

  const displayDish = dish ?? lastDishRef.current;

  if (!displayDish) return null;

  const handleAddToCart = (selectedOptions: DishOption[]) => {
    if (!dish) return;
    addItem(
      restaurantId,
      dish.id,
      selectedOptions.map((o) => o.id),
    );
    onClose();
  };

  return (
    <DishOptionModal
      dish={displayDish}
      isOpen={!!dish}
      isAuthenticated={account !== null}
      onClose={onClose}
      onAddToCart={handleAddToCart}
    />
  );
}
