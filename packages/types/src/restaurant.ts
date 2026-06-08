import type { Dish } from './dish';

export type RestaurantCategory =
  | 'burgers'
  | 'pizza'
  | 'sushi'
  | 'mexican'
  | 'chinese'
  | 'indian'
  | 'thai'
  | 'italian'
  | 'healthy'
  | 'dessert'
  | 'coffee'
  | 'breakfast';

export type Restaurant = {
  id: string;
  owner: string;
  name: string;
  description: string;
  location: string;
  category: RestaurantCategory;
  isOpen: boolean;
  avatarUrl?: string;
  ratingSum: number; // Sum of all ratings (for running average)
  ratingCount: number; // Number of ratings
  deliveryTime?: string;
  dishes: Dish[];
};
