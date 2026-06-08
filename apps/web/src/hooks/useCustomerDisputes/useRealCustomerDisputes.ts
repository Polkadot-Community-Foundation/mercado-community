import { useState, useEffect, useCallback } from 'react';
import type {
  Dispute,
  DisputeTuple,
  OrderTuple,
  RestaurantCoreTuple,
} from '@mercado/types';
import {
  DisputeStatus,
  Verdict,
  decodeDisputeTuple,
  decodeOrderTuple,
  decodeRestaurantCoreTuple,
} from '@mercado/types';
import { useAuth } from '@mercado/core-hooks';

import { useContracts } from '../../contexts/ContractsContext';
import type {
  UseCustomerDisputesResult,
  CustomerDispute,
} from '../../contexts/DataContext/DataContext';
import {
  DISPUTE_SCAN_LIMIT,
  DEFAULT_RESTAURANT_NAME,
} from '../../lib/constants';

/**
 * Real implementation of customer disputes listing by scanning MercadoDisputes.
 */
export function useRealCustomerDisputes(): UseCustomerDisputesResult {
  const { disputes, core, isConnected } = useContracts();
  const { account } = useAuth();
  const [customerDisputes, setCustomerDisputes] = useState<CustomerDispute[]>(
    [],
  );
  const [hasMore, setHasMore] = useState(false);
  const [failedCount, setFailedCount] = useState(0);

  const fetchDisputes = useCallback(async () => {
    if (!disputes || !core || !isConnected || !account) {
      setCustomerDisputes([]);
      setFailedCount(0);
      return;
    }

    try {
      const nextId = (await disputes.read<bigint>('nextDisputeId')) || 1n;
      const total = Number(nextId) - 1;

      if (total === 0) {
        setCustomerDisputes([]);
        setFailedCount(0);
        return;
      }

      // Scan recent disputes using parallel batch reads
      const maxToScan = Math.min(total, DISPUTE_SCAN_LIMIT);
      const moreExist = total > DISPUTE_SCAN_LIMIT;

      // Build list of dispute IDs to fetch (newest to oldest)
      const idsToFetch: number[] = [];
      for (let i = total; i > total - maxToScan && i > 0; i--) {
        idsToFetch.push(i);
      }

      // Batch fetch all disputes in parallel
      const disputeResults = await Promise.all(
        idsToFetch.map(async (id) => {
          try {
            const result = (await disputes.read('disputes', [
              BigInt(id),
            ])) as DisputeTuple;
            return { id, result, error: null };
          } catch (err) {
            return { id, result: null, error: err };
          }
        }),
      );

      // Process dispute results and collect order IDs to fetch
      interface DecodedDispute {
        id: number;
        decoded: NonNullable<ReturnType<typeof decodeDisputeTuple>>;
      }
      const decodedDisputes: DecodedDispute[] = [];
      const orderIdsToFetch = new Set<string>();
      let failures = 0;

      for (const { id, result, error } of disputeResults) {
        if (error) {
          console.warn(
            `[useRealCustomerDisputes] Failed to read dispute ${id}:`,
            error,
          );
          failures++;
          continue;
        }

        const decoded = decodeDisputeTuple(result as DisputeTuple);
        if (!decoded) continue;

        decodedDisputes.push({ id, decoded });
        orderIdsToFetch.add(decoded.orderId);
      }

      // Batch fetch all related orders in parallel
      const orderResults = await Promise.all(
        [...orderIdsToFetch].map(async (orderId) => {
          try {
            const result = (await core.read('orders', [
              BigInt(orderId),
            ])) as OrderTuple;
            return { orderId, result, error: null };
          } catch (err) {
            return { orderId, result: null, error: err };
          }
        }),
      );

      // Build order lookup map
      const orderMap = new Map<
        string,
        NonNullable<ReturnType<typeof decodeOrderTuple>>
      >();
      for (const { orderId, result, error } of orderResults) {
        if (error || !result) continue;
        const decoded = decodeOrderTuple(result);
        if (decoded) {
          orderMap.set(orderId, decoded);
        }
      }

      // Filter disputes for current customer and collect restaurant IDs
      const matchedDisputes: Array<{
        id: number;
        decoded: NonNullable<ReturnType<typeof decodeDisputeTuple>>;
        orderDecoded: NonNullable<ReturnType<typeof decodeOrderTuple>>;
      }> = [];
      const restaurantIdsToFetch = new Set<string>();

      for (const { id, decoded } of decodedDisputes) {
        const orderDecoded = orderMap.get(decoded.orderId);
        if (
          !orderDecoded ||
          orderDecoded.customer.toLowerCase() !== account.address.toLowerCase()
        ) {
          continue;
        }

        matchedDisputes.push({ id, decoded, orderDecoded });
        restaurantIdsToFetch.add(orderDecoded.restaurantId);
      }

      // Batch fetch restaurant names in parallel
      const restaurantNames = new Map<string, string>();
      if (restaurantIdsToFetch.size > 0) {
        const restaurantResults = await Promise.all(
          [...restaurantIdsToFetch].map(async (restaurantId) => {
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

      // Build final customer disputes
      const results: CustomerDispute[] = [];

      for (const { id, decoded, orderDecoded } of matchedDisputes) {
        const initiator =
          decoded.initiator.toLowerCase() === account.address.toLowerCase()
            ? 'customer'
            : 'restaurant';

        const dispute: Dispute = {
          id: id.toString(),
          orderId: decoded.orderId,
          customerId: orderDecoded.customer,
          restaurantId: orderDecoded.restaurantId,
          status:
            decoded.verdict === Verdict.Pending
              ? DisputeStatus.OPEN
              : DisputeStatus.RESOLVED,
          verdict: decoded.verdict,
          initiatorEvidenceCID: decoded.evidenceCID,
          counterEvidenceCID: decoded.counterCID,
          initiatorStake: decoded.initiatorStake,
          challengerStake: decoded.challengerStake,
          faultAccepted: decoded.faultAccepted,
          initiator,
          createdAt: decoded.createdAt,
          resolvedAt: decoded.resolvedAt,
        };

        results.push({
          dispute,
          restaurantName:
            restaurantNames.get(orderDecoded.restaurantId) ??
            DEFAULT_RESTAURANT_NAME,
        });
      }

      setCustomerDisputes(results);
      setHasMore(moreExist);
      setFailedCount(failures);
    } catch (err) {
      console.error('Failed to fetch customer disputes:', err);
      setCustomerDisputes([]);
      setHasMore(false);
      setFailedCount(0);
    }
  }, [disputes, core, isConnected, account]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  return {
    disputes: customerDisputes,
    hasMore,
    failedCount: failedCount > 0 ? failedCount : undefined,
  };
}
