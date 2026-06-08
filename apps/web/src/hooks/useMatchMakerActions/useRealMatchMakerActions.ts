import { useCallback, useState } from 'react';
import type { MatchMakerRegistrationInput } from '@mercado/types';
import { useAuth } from '@mercado/core-hooks';

import { useContracts } from '../../contexts/ContractsContext';
import type { UseMatchMakerActionsResult } from '../../contexts/DataContext/DataContext';
import { percentToBps } from '../../lib/pricing';
import { signAndSubmitWithTimeout } from '../../lib/contracts';

const MAX_FEE_BPS = 1000; // 10%

/**
 * Validate fee percentage and return basis points.
 * Throws if invalid.
 */
function validateAndConvertFee(feePercent: number): number {
  const feeBps = percentToBps(feePercent);
  if (feeBps < 0) {
    throw new Error('Fee cannot be negative');
  }
  if (feeBps > MAX_FEE_BPS) {
    throw new Error('Fee cannot exceed 10%');
  }
  return feeBps;
}

/**
 * Real implementation of matchmaker actions using MercadoMatchmakers contract.
 */
export function useRealMatchMakerActions(): UseMatchMakerActionsResult {
  const { matchmakers, isConnected } = useContracts();
  const { account, signer } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerMatchMaker = useCallback(
    async (input: MatchMakerRegistrationInput): Promise<string> => {
      if (!matchmakers || !isConnected) {
        throw new Error('Contracts not connected');
      }
      if (!account || !signer) {
        throw new Error('Not signed in');
      }
      if (!input.name.trim()) {
        throw new Error('Name is required');
      }

      const feeBps = validateAndConvertFee(input.feePercentage);

      setIsLoading(true);
      setError(null);

      try {
        const result = await matchmakers.write<bigint>(
          'registerMatchMaker',
          [input.name.trim(), feeBps],
          account.address,
        );

        const tx = result.send();
        await signAndSubmitWithTimeout(tx, signer);

        return result.response.toString();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Registration failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [matchmakers, isConnected, account, signer],
  );

  const updateFee = useCallback(
    async (newFeePercent: number): Promise<void> => {
      if (!matchmakers || !isConnected) {
        throw new Error('Contracts not connected');
      }
      if (!account || !signer) {
        throw new Error('Not signed in');
      }

      const feeBps = validateAndConvertFee(newFeePercent);

      setIsLoading(true);
      setError(null);

      try {
        const result = await matchmakers.write(
          'updateMatchMakerFee',
          [feeBps],
          account.address,
        );

        const tx = result.send();
        await signAndSubmitWithTimeout(tx, signer);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Fee update failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [matchmakers, isConnected, account, signer],
  );

  const claimFees = useCallback(
    async (toAddress: string): Promise<void> => {
      if (!matchmakers || !isConnected) {
        throw new Error('Contracts not connected');
      }
      if (!account || !signer) {
        throw new Error('Not signed in');
      }
      if (!toAddress) {
        throw new Error('Destination address is required');
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await matchmakers.write(
          'claimMatchMakerFees',
          [toAddress],
          account.address,
        );

        const tx = result.send();
        await signAndSubmitWithTimeout(tx, signer);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Fee claim failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [matchmakers, isConnected, account, signer],
  );

  return { registerMatchMaker, updateFee, claimFees, isLoading, error };
}
