import { useState, useEffect, useCallback } from 'react';
import type { Dispute, DisputeTuple, OrderTuple } from '@mercado/types';
import {
  DisputeStatus,
  Verdict,
  decodeDisputeTuple,
  decodeOrderTuple,
} from '@mercado/types';
import { useAuth } from '@mercado/core-hooks';

import { useContracts } from '../../contexts/ContractsContext';
import type {
  UseRestaurantDisputesResult,
  RestaurantDispute,
} from '../../contexts/DataContext/DataContext';
import {
  DISPUTE_SCAN_LIMIT,
  DISPUTE_RESPONSE_WINDOW_MS,
} from '../../lib/constants';
import { toEvmAddress } from '../../lib/contracts';

/**
 * Real implementation of restaurant disputes listing by scanning MercadoDisputes.
 */
export function useRealRestaurantDisputes(): UseRestaurantDisputesResult {
  const { disputes, core, isConnected } = useContracts();
  const { account } = useAuth();
  const [restaurantDisputes, setRestaurantDisputes] = useState<
    RestaurantDispute[]
  >([]);
  const [hasMore, setHasMore] = useState(false);
  const [failedCount, setFailedCount] = useState(0);

  const fetchDisputes = useCallback(async () => {
    if (!disputes || !core || !isConnected || !account) {
      setRestaurantDisputes([]);
      setFailedCount(0);
      return;
    }

    try {
      // Get restaurant ID for this owner (convert SS58 to EVM address)
      const evmAddress = toEvmAddress(account.address);
      const restaurantId = (await core.read<bigint>('ownerToRestaurant', [
        evmAddress,
      ])) as bigint;

      if (!restaurantId || restaurantId === 0n) {
        setRestaurantDisputes([]);
        setFailedCount(0);
        return;
      }

      const nextId = (await disputes.read<bigint>('nextDisputeId')) || 1n;
      const total = Number(nextId) - 1;

      if (total === 0) {
        setRestaurantDisputes([]);
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
            `[useRealRestaurantDisputes] Failed to read dispute ${id}:`,
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

      // Filter disputes for current restaurant and build results
      const results: RestaurantDispute[] = [];

      for (const { id, decoded } of decodedDisputes) {
        const orderDecoded = orderMap.get(decoded.orderId);
        if (
          !orderDecoded ||
          orderDecoded.restaurantId !== restaurantId.toString()
        ) {
          continue;
        }

        const initiator =
          decoded.initiator.toLowerCase() ===
          orderDecoded.customer.toLowerCase()
            ? 'customer'
            : 'restaurant';
        const responseWindowExpired =
          decoded.verdict === Verdict.Pending &&
          !decoded.counterCID && // no counter evidence
          Date.now() > decoded.createdAt + DISPUTE_RESPONSE_WINDOW_MS;

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
          customerAddress: orderDecoded.customer,
          responseWindowExpired,
        });
      }

      setRestaurantDisputes(results);
      setHasMore(moreExist);
      setFailedCount(failures);
    } catch (err) {
      console.error('Failed to fetch restaurant disputes:', err);
      setRestaurantDisputes([]);
      setHasMore(false);
      setFailedCount(0);
    }
  }, [disputes, core, isConnected, account]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  return {
    disputes: restaurantDisputes,
    hasMore,
    failedCount: failedCount > 0 ? failedCount : undefined,
  };
}
