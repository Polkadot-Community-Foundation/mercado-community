import { useState, useCallback } from 'react';
import { Verdict, DisputeStatus } from '@mercado/types';

import { useMockData } from './useMockData';

export function useResolveDispute() {
  const { updateDispute } = useMockData();
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveDispute = useCallback(
    async (disputeId: string, verdict: Verdict) => {
      setIsResolving(true);
      setError(null);

      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        updateDispute(disputeId, {
          status: DisputeStatus.RESOLVED,
          verdict,
          resolvedAt: Date.now(),
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to resolve dispute',
        );
        throw err;
      } finally {
        setIsResolving(false);
      }
    },
    [updateDispute],
  );

  return { resolveDispute, isResolving, error };
}
