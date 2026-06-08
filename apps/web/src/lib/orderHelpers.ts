import type { OrderItem, RestaurantMetadata, DishOption } from '@mercado/types';

export type ResolvedOrderItem = {
  dishId: string;
  dishName: string;
  dishDescription: string;
  basePrice: bigint;
  selectedOptions: DishOption[];
  itemTotal: bigint;
};

export function resolveOrderItem(
  item: OrderItem,
  metadata: RestaurantMetadata,
): ResolvedOrderItem {
  const dish = metadata.dishes.find((d) => d.id === item.dishId);
  if (!dish) {
    return {
      dishId: item.dishId,
      dishName: 'Unknown dish',
      dishDescription: '',
      basePrice: 0n,
      selectedOptions: [],
      itemTotal: 0n,
    };
  }

  const selectedOptions = item.selectedOptionIds
    .map((optId) => dish.options.find((o: DishOption) => o.id === optId))
    .filter((o): o is DishOption => o !== undefined);

  const optionsTotal = selectedOptions.reduce((sum, o) => sum + o.price, 0n);

  return {
    dishId: dish.id,
    dishName: dish.name,
    dishDescription: dish.description,
    basePrice: dish.basePrice,
    selectedOptions,
    itemTotal: dish.basePrice + optionsTotal,
  };
}

export function resolveOrderTotal(
  items: OrderItem[],
  metadata: RestaurantMetadata,
): bigint {
  return items.reduce(
    (sum, item) => sum + resolveOrderItem(item, metadata).itemTotal,
    0n,
  );
}

/**
 * Check if any cart items are stale (dish no longer exists in menu).
 * Returns validation result with count and user-friendly error message.
 */
export function validateCartItems(
  items: OrderItem[],
  metadata: RestaurantMetadata,
): { valid: boolean; staleItemCount: number; errorMessage: string | null } {
  let staleItemCount = 0;
  for (const item of items) {
    const dish = metadata.dishes.find((d) => d.id === item.dishId);
    if (!dish) {
      staleItemCount++;
    }
  }

  const errorMessage =
    staleItemCount > 0
      ? `${staleItemCount} item${staleItemCount > 1 ? 's' : ''} in your cart ${staleItemCount > 1 ? 'are' : 'is'} no longer available. Please update your order.`
      : null;

  return { valid: staleItemCount === 0, staleItemCount, errorMessage };
}
