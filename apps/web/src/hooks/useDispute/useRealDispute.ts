import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  Dispute,
  DisputeEvidence,
  DisputeTuple,
  OrderTuple,
} from '@mercado/types';
import {
  DisputeStatus,
  Verdict,
  decodeDisputeTuple,
  decodeOrderTuple,
} from '@mercado/types';

import { useContracts } from '../../contexts/ContractsContext';
import type { UseDisputeResult } from '../../contexts/DataContext/DataContext';
import { IPFS_GATEWAY_FOR_DISPLAY } from '../../lib/bulletinConfig';

// Counter for generating unique request IDs
let requestIdCounter = 0;

/**
 * Fetch evidence from IPFS gateway
 */
async function fetchEvidence(
  cid: string,
): Promise<DisputeEvidence | undefined> {
  if (!cid) {
    return undefined;
  }

  try {
    const response = await fetch(`${IPFS_GATEWAY_FOR_DISPLAY}${cid}`);
    if (!response.ok) {
      throw new Error('Failed to fetch evidence');
    }
    return await response.json();
  } catch (err) {
    console.warn('Failed to fetch evidence from IPFS:', err);
    return undefined;
  }
}

/**
 * Real implementation of dispute fetching from MercadoDisputes contract.
 */
export function useRealDispute(disputeId: string): UseDisputeResult {
  const { disputes, core, isConnected } = useContracts();
  const [dispute, setDispute] = useState<Dispute | undefined>(undefined);
  const [initiatorEvidence, setInitiatorEvidence] = useState<
    DisputeEvidence | undefined
  >(undefined);
  const [counterEvidence, setCounterEvidence] = useState<
    DisputeEvidence | undefined
  >(undefined);
  const currentRequestIdRef = useRef<number>(0);

  const fetchDispute = useCallback(async () => {
    // Generate a unique request ID for this fetch
    const requestId = ++requestIdCounter;
    currentRequestIdRef.current = requestId;

    // Clear all state at the start of a new fetch
    setDispute(undefined);
    setInitiatorEvidence(undefined);
    setCounterEvidence(undefined);

    if (!disputes || !isConnected || !disputeId) {
      return;
    }

    try {
      const result = (await disputes.read('disputes', [
        BigInt(disputeId),
      ])) as DisputeTuple;

      // Guard: check if this request is still current
      if (currentRequestIdRef.current !== requestId) return;

      const decoded = decodeDisputeTuple(result);
      if (!decoded) {
        setDispute(undefined);
        return;
      }

      // Determine customer and restaurant from order
      let customerId = '';
      let restaurantId = '';
      if (core) {
        try {
          const orderResult = (await core.read('orders', [
            BigInt(decoded.orderId),
          ])) as OrderTuple;
          // Guard again after async call
          if (currentRequestIdRef.current !== requestId) return;
          const orderDecoded = decodeOrderTuple(orderResult);
          if (orderDecoded) {
            customerId = orderDecoded.customer;
            restaurantId = orderDecoded.restaurantId;
          }
        } catch {
          // Use defaults
        }
      }

      const initiator =
        decoded.initiator.toLowerCase() === customerId.toLowerCase()
          ? 'customer'
          : 'restaurant';

      const status =
        decoded.verdict === Verdict.Pending
          ? DisputeStatus.OPEN
          : DisputeStatus.RESOLVED;

      setDispute({
        id: disputeId,
        orderId: decoded.orderId,
        customerId,
        restaurantId,
        status,
        verdict: decoded.verdict,
        initiatorEvidenceCID: decoded.evidenceCID,
        counterEvidenceCID: decoded.counterCID,
        initiatorStake: decoded.initiatorStake,
        challengerStake: decoded.challengerStake,
        faultAccepted: decoded.faultAccepted,
        initiator,
        createdAt: decoded.createdAt,
        resolvedAt: decoded.resolvedAt,
      });

      // Fetch evidence from IPFS with guarded updates
      if (decoded.evidenceCID) {
        fetchEvidence(decoded.evidenceCID).then((evidence) => {
          if (currentRequestIdRef.current === requestId) {
            setInitiatorEvidence(evidence);
          }
        });
      }
      if (decoded.counterCID) {
        fetchEvidence(decoded.counterCID).then((evidence) => {
          if (currentRequestIdRef.current === requestId) {
            setCounterEvidence(evidence);
          }
        });
      }
    } catch (err) {
      // Guard before setting error state
      if (currentRequestIdRef.current === requestId) {
        console.error('Failed to fetch dispute:', err);
        setDispute(undefined);
      }
    }
  }, [disputes, core, isConnected, disputeId]);

  useEffect(() => {
    fetchDispute();
  }, [fetchDispute]);

  return { dispute, initiatorEvidence, counterEvidence };
}
