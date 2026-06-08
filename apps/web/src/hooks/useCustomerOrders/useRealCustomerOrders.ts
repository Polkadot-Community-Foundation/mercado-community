import { useState, useEffect, useCallback } from 'react';
import type { Order, OrderTuple, RestaurantCoreTuple } from '@mercado/types';
import { decodeOrderTuple, decodeRestaurantCoreTuple } from '@mercado/types';
import { useAuth } from '@mercado/core-hooks';

import { useContracts } from '../../contexts/ContractsContext';
import type {
  UseCustomerOrdersResult,
  CustomerOrder,
} from '../../contexts/DataContext/DataContext';
import {
  loadOrderItemsBatch,
  loadOrderMetadataBatch,
} from '../../lib/orderItemsStorage';
import {
  ORDER_SCAN_LIMIT,
  CREATED_AT_FALLBACK_OFFSET_MS,
  DEFAULT_RESTAURANT_NAME,
} from '../../lib/constants';

/**
 * Real implementation of customer orders listing by scanning MercadoCore.
 *
 * Scans recent orders and filters by customer address.
 * Order items are loaded from client-side storage.
 * Works for small-scale testing; use an indexer for production.
 */
export function useRealCustomerOrders(): UseCustomerOrdersResult {
  const { core, isConnected } = useContracts();
  const { account } = useAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [failedCount, setFailedCount] = useState(0);

  const fetchOrders = useCallback(async () => {
    if (!core || !isConnected || !account) {
      setOrders([]);
      setFailedCount(0);
      return;
    }

    try {
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

      // Process results and collect matching orders
      interface MatchedOrder {
        id: number;
        decoded: NonNullable<ReturnType<typeof decodeOrderTuple>>;
      }
      const matchedOrders: MatchedOrder[] = [];
      let failures = 0;

      for (const { id, result, error } of orderResults) {
        if (error) {
          console.warn(
            `[useRealCustomerOrders] Failed to read order ${id}:`,
            error,
          );
          failures++;
          continue;
        }

        const decoded = decodeOrderTuple(result as OrderTuple);
        if (!decoded) continue;

        // Check if this order belongs to the current customer
        if (decoded.customer.toLowerCase() === account.address.toLowerCase()) {
          matchedOrders.push({ id, decoded });
        }
      }

      // Batch fetch restaurant names for all matching orders
      const uniqueRestaurantIds = [
        ...new Set(matchedOrders.map((o) => o.decoded.restaurantId)),
      ];
      const restaurantNames = new Map<string, string>();

      if (uniqueRestaurantIds.length > 0) {
        const restaurantResults = await Promise.all(
          uniqueRestaurantIds.map(async (restaurantId) => {
            try {
              const result = (await core.read('restaurants', [
                BigInt(restaurantId),
              ])) as RestaurantCoreTuple;
              const decoded = decodeRestaurantCoreTuple(result);
              return {
                restaurantId,
                name: decoded?.name ?? DEFAULT_RESTAURANT_NAME,
              };
            } catch {
              return { restaurantId, name: DEFAULT_RESTAURANT_NAME };
            }
          }),
        );

        for (const { restaurantId, name } of restaurantResults) {
          restaurantNames.set(restaurantId, name);
        }
      }

      // Build final customer orders
      const customerOrders: CustomerOrder[] = [];
      const orderIds: string[] = [];

      for (const { id, decoded } of matchedOrders) {
        const orderId = id.toString();
        orderIds.push(orderId);

        const order: Order = {
          id: orderId,
          restaurantId: decoded.restaurantId,
          customerId: decoded.customer,
          items: [], // Will be filled below
          totalPrice: decoded.price,
          status: decoded.status,
          createdAt: 0, // Will be populated from metadata below
          completedAt: decoded.completedAt,
        };

        customerOrders.push({
          order,
          restaurantName:
            restaurantNames.get(decoded.restaurantId) ??
            DEFAULT_RESTAURANT_NAME,
        });
      }

      // Load order items and metadata for all orders in batch
      if (orderIds.length > 0) {
        const [itemsMap, metadataMap] = await Promise.all([
          loadOrderItemsBatch(orderIds),
          loadOrderMetadataBatch(orderIds),
        ]);
        for (const customerOrder of customerOrders) {
          const order = customerOrder.order;
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

      setOrders(customerOrders);
      setHasMore(moreExist);
      setFailedCount(failures);
    } catch (err) {
      console.error('Failed to fetch customer orders:', err);
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
