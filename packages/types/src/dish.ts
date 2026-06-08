import type { DishOption } from './dish-option';

export type Dish = {
  id: string;
  name: string;
  description: string;
  basePrice: bigint;
  inStock: boolean;
  options: DishOption[];
  photoUrl?: string;
};
