import { useState, useEffect, useCallback } from 'react';

import { useContracts } from '../contexts/ContractsContext';
import { getNetworkConfig } from '../config/network';

export interface UseTokenBalanceResult {
  /** Token balance in base units (6 decimals for pUSD) */
  balance: bigint | null;
  /** Whether the balance is being fetched */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Refetch the balance */
  refetch: () => void;
}

/**
 * Hook to query pUSD token balance for an account.
 *
 * Uses the Assets pallet to query the account's token balance.
 *
 * @param account - SS58 address of the account to query
 * @returns Token balance info
 */
export function useTokenBalance(
  account: string | undefined,
): UseTokenBalanceResult {
  const { typedApi, isConnected } = useContracts();
  const [balance, setBalance] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchCounter, setRefetchCounter] = useState(0);

  const config = getNetworkConfig();

  const refetch = useCallback(() => {
    setRefetchCounter((c) => c + 1);
  }, []);

  useEffect(() => {
    if (!typedApi || !isConnected || !account) {
      setBalance(null);
      setIsLoading(false);
      setError(null); // Clear stale errors when disconnected
      return;
    }

    let cancelled = false;

    async function fetchBalance() {
      setIsLoading(true);
      setError(null);

      try {
        const entry = await typedApi!.query.Assets.Account.getValue(
          config.token.assetId,
          account!,
          { at: 'best' },
        );

        if (cancelled) return;

        if (entry) {
          setBalance(BigInt(entry.balance));
        } else {
          // Account doesn't have this asset yet
          setBalance(0n);
        }
      } catch (err) {
        if (cancelled) return;
        console.error('[useTokenBalance] Failed to fetch balance:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to fetch balance',
        );
        setBalance(null);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchBalance();

    return () => {
      cancelled = true;
    };
  }, [typedApi, isConnected, account, config.token.assetId, refetchCounter]);

  return { balance, isLoading, error, refetch };
}
