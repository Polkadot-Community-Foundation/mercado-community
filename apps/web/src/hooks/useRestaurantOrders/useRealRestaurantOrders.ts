import { useState, useEffect, useCallback } from 'react';
import type { Order, OrderTuple } from '@mercado/types';
import { decodeOrderTuple } from '@mercado/types';
import { useAuth } from '@mercado/core-hooks';

import { useContracts } from '../../contexts/ContractsContext';
import type { UseRestaurantOrdersResult } from '../../contexts/DataContext/DataContext';
import {
  loadOrderItemsBatch,
  loadOrderMetadataBatch,
} from '../../lib/orderItemsStorage';
import {
  ORDER_SCAN_LIMIT,
  CREATED_AT_FALLBACK_OFFSET_MS,
} from '../../lib/constants';
import { toEvmAddress } from '../../lib/contracts';

/**
 * Real implementation of restaurant orders listing by scanning MercadoCore.
 *
 * Scans recent orders and filters by restaurant owner.
 * Order items are loaded from client-side storage.
 * Works for small-scale testing; use an indexer for production.
 */
export function useRealRestaurantOrders(): UseRestaurantOrdersResult {
  const { core, isConnected } = useContracts();
  const { account } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [failedCount, setFailedCount] = useState(0);

  const fetchOrders = useCallback(async () => {
    if (!core || !isConnected || !account) {
      setOrders([]);
      setFailedCount(0);
      return;
    }

    try {
      // First, get the restaurant ID for this owner (convert SS58 to EVM address)
      const evmAddress = toEvmAddress(account.address);
      const restaurantId = (await core.read<bigint>('ownerToRestaurant', [
        evmAddress,
      ])) as bigint;

      if (!restaurantId || restaurantId === 0n) {
        setOrders([]);
        setFailedCount(0);
        return;
      }

      const nextId = (await core.read<bigint>('nextOrderId')) || 1n;
      const total = Number(nextId) - 1;

      if (total === 0) {
        setOrders([]);
        setFailedCount(0);
        return;
      }

      // Scan recent orders using parallel batch reads
      const maxToScan = Math.min(total, ORDER_SCAN_LIMIT);
      const moreExist = total > ORDER_SCAN_LIMIT;

      // Build list of order IDs to fetch (newest to oldest)
      const idsToFetch: number[] = [];
      for (let i = total; i > total - maxToScan && i > 0; i--) {
        idsToFetch.push(i);
      }

      // Batch fetch all orders in parallel
      const orderResults = await Promise.all(
        idsToFetch.map(async (id) => {
          try {
            const result = (await core.read('orders', [
              BigInt(id),
            ])) as OrderTuple;
            return { id, result, error: null };
          } catch (err) {
            return { id, result: null, error: err };
          }
        }),
      );

      // Process results
      const restaurantOrders: Order[] = [];
      const orderIds: string[] = [];
      let failures = 0;

      for (const { id, result, error } of orderResults) {
        if (error) {
          console.warn(
            `[useRealRestaurantOrders] Failed to read order ${id}:`,
            error,
          );
          failures++;
          continue;
        }

        const decoded = decodeOrderTuple(result as OrderTuple);
        if (!decoded) continue;

        // Check if this order belongs to the current restaurant
        if (decoded.restaurantId === restaurantId.toString()) {
          const orderId = id.toString();
          orderIds.push(orderId);

          restaurantOrders.push({
            id: orderId,
            restaurantId: decoded.restaurantId,
            customerId: decoded.customer,
            items: [], // Will be filled below
            totalPrice: decoded.price,
            status: decoded.status,
            createdAt: 0, // Will be populated from metadata below
            completedAt: decoded.completedAt,
          });
        }
      }

      // Load order items and metadata for all orders in batch
      if (orderIds.length > 0) {
        const [itemsMap, metadataMap] = await Promise.all([
          loadOrderItemsBatch(orderIds),
          loadOrderMetadataBatch(orderIds),
        ]);
        for (const order of restaurantOrders) {
          order.items = itemsMap[order.id] ?? [];
          // Use stored createdAt, or estimate from completedAt, or mark as unknown (0)
          const metadata = metadataMap[order.id];
          order.createdAt =
            metadata?.createdAt ??
            (order.completedAt
              ? order.completedAt - CREATED_AT_FALLBACK_OFFSET_MS
              : 0);
        }
      }

      setOrders(restaurantOrders);
      setHasMore(moreExist);
      setFailedCount(failures);
    } catch (err) {
      console.error('Failed to fetch restaurant orders:', err);
      setOrders([]);
      setHasMore(false);
      setFailedCount(0);
    }
  }, [core, isConnected, account]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    hasMore,
    failedCount: failedCount > 0 ? failedCount : undefined,
  };
}
