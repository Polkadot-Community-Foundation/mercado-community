/**
 * Order items and metadata storage utility.
 *
 * The MercadoCore contract stores itemsData on-chain (encoded bytes), but client-side
 * storage provides richer metadata access and faster lookups without chain queries.
 * This utility persists order details using Host API compliant storage.
 */
import type { OrderItem } from '../types';

import { loadFromStorageAsync, saveToStorageAsync } from './hostStorage';

const ITEMS_STORAGE_KEY = 'mercado:orderItems';
const METADATA_STORAGE_KEY = 'mercado:orderMetadata';

type OrderItemsMap = Record<string, OrderItem[]>;

/** Order metadata stored client-side */
export interface OrderMetadata {
  createdAt: number;
  restaurantId: string;
}

type OrderMetadataMap = Record<string, OrderMetadata>;

/**
 * Save order items for a specific order.
 */
export async function saveOrderItems(
  orderId: string,
  items: OrderItem[],
): Promise<void> {
  const existing = await loadFromStorageAsync<OrderItemsMap>(
    ITEMS_STORAGE_KEY,
    {},
  );
  existing[orderId] = items;
  await saveToStorageAsync(ITEMS_STORAGE_KEY, existing);
}

/**
 * Save order metadata (creation time, restaurant ID).
 * Should be called immediately after placing an order.
 */
export async function saveOrderMetadata(
  orderId: string,
  metadata: OrderMetadata,
): Promise<void> {
  const existing = await loadFromStorageAsync<OrderMetadataMap>(
    METADATA_STORAGE_KEY,
    {},
  );
  existing[orderId] = metadata;
  await saveToStorageAsync(METADATA_STORAGE_KEY, existing);
}

/**
 * Load order metadata for a specific order.
 * Returns undefined if not found.
 */
export async function loadOrderMetadata(
  orderId: string,
): Promise<OrderMetadata | undefined> {
  const all = await loadFromStorageAsync<OrderMetadataMap>(
    METADATA_STORAGE_KEY,
    {},
  );
  return all[orderId];
}

/**
 * Load order metadata for multiple orders at once.
 */
export async function loadOrderMetadataBatch(
  orderIds: string[],
): Promise<Record<string, OrderMetadata | undefined>> {
  const all = await loadFromStorageAsync<OrderMetadataMap>(
    METADATA_STORAGE_KEY,
    {},
  );
  const result: Record<string, OrderMetadata | undefined> = {};
  for (const id of orderIds) {
    result[id] = all[id];
  }
  return result;
}

/**
 * Load order items for a specific order.
 * Returns empty array if not found.
 */
export async function loadOrderItems(orderId: string): Promise<OrderItem[]> {
  const all = await loadFromStorageAsync<OrderItemsMap>(ITEMS_STORAGE_KEY, {});
  return all[orderId] ?? [];
}

/**
 * Load order items for multiple orders at once.
 * Returns a map of orderId -> items.
 */
export async function loadOrderItemsBatch(
  orderIds: string[],
): Promise<Record<string, OrderItem[]>> {
  const all = await loadFromStorageAsync<OrderItemsMap>(ITEMS_STORAGE_KEY, {});
  const result: Record<string, OrderItem[]> = {};
  for (const id of orderIds) {
    result[id] = all[id] ?? [];
  }
  return result;
}
