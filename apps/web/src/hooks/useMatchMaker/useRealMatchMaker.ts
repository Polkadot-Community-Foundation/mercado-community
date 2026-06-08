import { useState, useEffect, useCallback, useRef } from 'react';
import type { MatchMaker, MatchMakerTuple } from '@mercado/types';
import { decodeMatchMakerTuple } from '@mercado/types';

import { useContracts } from '../../contexts/ContractsContext';
import type { UseMatchMakerResult } from '../../contexts/DataContext/DataContext';

// Counter for generating unique request IDs
let requestIdCounter = 0;

/**
 * Real implementation of matchmaker fetching from MercadoMatchmakers contract.
 */
export function useRealMatchMaker(id: string): UseMatchMakerResult {
  const { matchmakers, isConnected } = useContracts();
  const [matchMaker, setMatchMaker] = useState<MatchMaker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentRequestIdRef = useRef<number>(0);

  const fetchMatchMaker = useCallback(async () => {
    // Generate a unique request ID for this fetch
    const requestId = ++requestIdCounter;
    currentRequestIdRef.current = requestId;

    if (!matchmakers || !isConnected || !id) {
      setMatchMaker(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Fetch matchmaker data
      const result = (await matchmakers.read('getMatchMaker', [
        BigInt(id),
      ])) as MatchMakerTuple;

      // Guard: check if this request is still current
      if (currentRequestIdRef.current !== requestId) return;

      const decoded = decodeMatchMakerTuple(result);
      if (!decoded) {
        setMatchMaker(null);
        setIsLoading(false);
        return;
      }

      // Fetch accumulated fees
      const fees = (await matchmakers.read('getMatchMakerFees', [
        BigInt(id),
      ])) as bigint;

      // Guard again after second async call
      if (currentRequestIdRef.current !== requestId) return;

      setMatchMaker({
        id: decoded.id,
        owner: decoded.owner,
        name: decoded.name,
        feePercentage: decoded.feePercentage,
        registeredAt: decoded.registeredAt,
        active: decoded.active,
        feesAccumulated: fees,
      });
      setIsLoading(false);
    } catch (err) {
      // Guard before setting error state
      if (currentRequestIdRef.current !== requestId) return;
      console.error('Failed to fetch matchmaker:', err);
      setMatchMaker(null);
      setIsLoading(false);
    }
  }, [matchmakers, isConnected, id]);

  useEffect(() => {
    fetchMatchMaker();
  }, [fetchMatchMaker]);

  return { matchMaker, isLoading };
}
