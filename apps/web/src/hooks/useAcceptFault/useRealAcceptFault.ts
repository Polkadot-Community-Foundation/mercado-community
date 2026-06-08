import { useCallback } from 'react';
import { useAuth } from '@mercado/core-hooks';

import { useContracts } from '../../contexts/ContractsContext';
import type { UseAcceptFaultResult } from '../../contexts/DataContext/DataContext';
import { signAndSubmitWithTimeout } from '../../lib/contracts';

/**
 * Real implementation of accepting fault using MercadoDisputes contract.
 */
export function useRealAcceptFault(): UseAcceptFaultResult {
  const { disputes, isConnected } = useContracts();
  const { account, signer } = useAuth();

  const acceptFault = useCallback(
    async (disputeId: string) => {
      if (!disputes || !isConnected) {
        throw new Error('Contracts not connected');
      }
      if (!account || !signer) {
        throw new Error('Not signed in');
      }

      // Dry-run the transaction
      const result = await disputes.write(
        'acceptFault',
        [BigInt(disputeId)],
        account.address,
      );

      // Submit the transaction
      const tx = result.send();
      await signAndSubmitWithTimeout(tx, signer);
    },
    [disputes, isConnected, account, signer],
  );

  return { acceptFault };
}
