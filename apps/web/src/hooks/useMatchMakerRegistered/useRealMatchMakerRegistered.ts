import { useState, useEffect, useCallback, useRef } from 'react';

import { useContracts } from '../../contexts/ContractsContext';
import type { UseMatchMakerRegisteredResult } from '../../contexts/DataContext/DataContext';
import { toEvmAddress } from '../../lib/contracts';

// Counter for generating unique request IDs
let requestIdCounter = 0;

/**
 * Real implementation to check if an address is registered as a matchmaker.
 */
export function useRealMatchMakerRegistered(
  address?: string | null,
): UseMatchMakerRegisteredResult {
  const { matchmakers, isConnected } = useContracts();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const currentRequestIdRef = useRef<number>(0);

  const checkRegistration = useCallback(async () => {
    // Generate a unique request ID for this fetch
    const requestId = ++requestIdCounter;
    currentRequestIdRef.current = requestId;

    if (!matchmakers || !isConnected || !address) {
      setIsRegistered(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Convert SS58 address to EVM H160 format for contract call
      const evmAddress = toEvmAddress(address);
      const result = (await matchmakers.read('isMatchMakerRegistered', [
        evmAddress,
      ])) as boolean;

      // Guard: check if this request is still current
      if (currentRequestIdRef.current !== requestId) return;

      setIsRegistered(result);
      setIsLoading(false);
    } catch (err) {
      // Guard before setting error state
      if (currentRequestIdRef.current !== requestId) return;
      console.error('Failed to check matchmaker registration:', err);
      setIsRegistered(false);
      setIsLoading(false);
    }
  }, [matchmakers, isConnected, address]);

  useEffect(() => {
    checkRegistration();
  }, [checkRegistration]);

  return { isRegistered, isLoading };
}
