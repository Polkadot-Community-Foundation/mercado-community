import { useState, useEffect, useCallback } from 'react';
import type { Order, OrderTuple } from '@mercado/types';
import { decodeOrderTuple } from '@mercado/types';

import { useContracts } from '../../contexts/ContractsContext';
import type { UseOrderResult } from '../../contexts/DataContext/DataContext';
import { loadOrderItems, loadOrderMetadata } from '../../lib/orderItemsStorage';

/**
 * Real implementation of order fetching from MercadoCore contract.
 * Order items are loaded from client-side storage.
 */
export function useRealOrder(orderId: string): UseOrderResult {
  const { core, isConnected } = useContracts();
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    if (!core || !isConnected || !orderId) {
      setOrder(undefined);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const result = (await core.read('orders', [
        BigInt(orderId),
      ])) as OrderTuple;
      const decoded = decodeOrderTuple(result);

      if (!decoded) {
        setOrder(undefined);
        return;
      }

      // Load order items and metadata from client-side storage
      const [items, metadata] = await Promise.all([
        loadOrderItems(orderId),
        loadOrderMetadata(orderId),
      ]);

      setOrder({
        id: orderId,
        restaurantId: decoded.restaurantId,
        customerId: decoded.customer,
        items,
        totalPrice: decoded.price,
        status: decoded.status,
        // Use stored creation time, or estimate from completedAt, or mark as unknown (0)
        createdAt:
          metadata?.createdAt ??
          (decoded.completedAt ? decoded.completedAt - 3600000 : 0),
        completedAt: decoded.completedAt,
      });
    } catch (err) {
      console.error('Failed to fetch order:', err);
      setOrder(undefined);
    } finally {
      setIsLoading(false);
    }
  }, [core, isConnected, orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return { order, isLoading };
}
