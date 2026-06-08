import type { Dish } from './dish';

// Represents the rich metadata for a restaurant (from bulletin/metadata layer).
// Used to resolve names, descriptions, and prices from OrderItem ids.
export type RestaurantMetadata = {
  id: string;
  name: string;
  description: string;
  location: string;
  isOpen: boolean;
  avatarUrl?: string;
  dishes: Dish[];
};
