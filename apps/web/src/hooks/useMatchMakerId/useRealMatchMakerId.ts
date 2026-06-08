import { useState, useEffect, useCallback, useRef } from 'react';

import { useContracts } from '../../contexts/ContractsContext';
import type { UseMatchMakerIdResult } from '../../contexts/DataContext/DataContext';
import { toEvmAddress } from '../../lib/contracts';

// Counter for generating unique request IDs
let requestIdCounter = 0;

/**
 * Real implementation to get matchmaker ID by owner address.
 */
export function useRealMatchMakerId(
  address?: string | null,
): UseMatchMakerIdResult {
  const { matchmakers, isConnected } = useContracts();
  const [matchMakerId, setMatchMakerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentRequestIdRef = useRef<number>(0);

  const fetchMatchMakerId = useCallback(async () => {
    // Generate a unique request ID for this fetch
    const requestId = ++requestIdCounter;
    currentRequestIdRef.current = requestId;

    if (!matchmakers || !isConnected || !address) {
      setMatchMakerId(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Convert SS58 address to EVM H160 format for contract call
      const evmAddress = toEvmAddress(address);
      const result = (await matchmakers.read('getMatchMakerIdByOwner', [
        evmAddress,
      ])) as bigint;

      // Guard: check if this request is still current
      if (currentRequestIdRef.current !== requestId) return;

      // ID 0 means not registered
      setMatchMakerId(result === 0n ? null : result.toString());
      setIsLoading(false);
    } catch (err) {
      // Guard before setting error state
      if (currentRequestIdRef.current !== requestId) return;
      console.error('Failed to fetch matchmaker ID:', err);
      setMatchMakerId(null);
      setIsLoading(false);
    }
  }, [matchmakers, isConnected, address]);

  useEffect(() => {
    fetchMatchMakerId();
  }, [fetchMatchMakerId]);

  return { matchMakerId, isLoading };
}
