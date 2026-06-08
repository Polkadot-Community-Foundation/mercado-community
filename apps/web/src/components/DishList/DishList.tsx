import type { Dish } from '../../types';
import { DishCard } from '../DishCard';

type DishListProps = {
  dishes: Dish[];
  onDishClick?: (dish: Dish) => void;
};

export function DishList({ dishes, onDishClick }: DishListProps) {
  if (dishes.length === 0) {
    return (
      <p className="py-8 text-center text-text-secondary">
        No dishes on the menu yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {dishes.map((dish) => (
        <DishCard
          key={dish.id}
          {...dish}
          onClick={onDishClick ? () => onDishClick(dish) : undefined}
        />
      ))}
    </div>
  );
}
