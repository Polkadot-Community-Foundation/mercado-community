import type { RestaurantCategory } from '../restaurant';
import type {
  RestaurantCoreTuple,
  RestaurantMetaTuple,
  RatingTuple,
} from '../contract-tuples';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const VALID_CATEGORIES: readonly RestaurantCategory[] = [
  'burgers',
  'pizza',
  'sushi',
  'mexican',
  'chinese',
  'indian',
  'thai',
  'italian',
  'healthy',
  'dessert',
  'coffee',
  'breakfast',
] as const;

const DEFAULT_CATEGORY: RestaurantCategory = 'burgers';

function isValidCategory(value: string): value is RestaurantCategory {
  return VALID_CATEGORIES.includes(value as RestaurantCategory);
}

export interface DecodedRestaurantCore {
  owner: string;
  name: string;
  location: string;
  isOpen: boolean;
}

export interface DecodedRestaurantMeta {
  description: string;
  avatarUrl: string;
  menuCID: string;
  category: RestaurantCategory;
}

export interface DecodedRating {
  ratingSum: number;
  ratingCount: number;
}

/**
 * Decode a restaurant core tuple from MercadoCore.restaurants().
 * Returns null if the restaurant doesn't exist (zero address owner).
 */
export function decodeRestaurantCoreTuple(
  tuple: RestaurantCoreTuple,
): DecodedRestaurantCore | null {
  const [owner, name, location, isOpen] = tuple;

  if (owner === ZERO_ADDRESS) {
    return null;
  }

  return { owner, name, location, isOpen };
}

/**
 * Decode a restaurant metadata tuple from RestaurantMeta.getMetadata().
 * Validates category against allowed values, falling back to 'burgers' if invalid.
 */
export function decodeRestaurantMetaTuple(
  tuple: RestaurantMetaTuple,
): DecodedRestaurantMeta {
  const [description, avatarUrl, menuCID, category] = tuple;

  return {
    description,
    avatarUrl,
    menuCID,
    category: isValidCategory(category) ? category : DEFAULT_CATEGORY,
  };
}

/**
 * Decode a rating tuple from MercadoRatings.getAverage().
 * The contract returns (average * 100, count), we compute ratingSum for running average.
 */
export function decodeRatingTuple(tuple: RatingTuple): DecodedRating {
  const [average, count] = tuple;

  // getAverage returns (average * 100, count), compute sum for running average
  const ratingSum = (Number(average) * Number(count)) / 100;
  const ratingCount = Number(count);

  return { ratingSum, ratingCount };
}
