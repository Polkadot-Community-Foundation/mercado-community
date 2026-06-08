import { useCallback } from 'react';
import { useAuth } from '@mercado/core-hooks';

import { useContracts } from '../../contexts/ContractsContext';
import type { UseCancelOrderResult } from '../../contexts/DataContext/DataContext';
import { signAndSubmitWithTimeout } from '../../lib/contracts';

/**
 * Real implementation of order cancellation using MercadoCore contract.
 * Refunds the customer automatically.
 */
export function useRealCancelOrder(): UseCancelOrderResult {
  const { core, isConnected } = useContracts();
  const { account, signer } = useAuth();

  const cancel = useCallback(
    async (orderId: string, onSuccess?: () => void) => {
      if (!core || !isConnected) {
        throw new Error('Contracts not connected');
      }
      if (!account || !signer) {
        throw new Error('Not signed in');
      }

      const result = await core.write(
        'cancelOrder',
        [BigInt(orderId)],
        account.address,
      );

      const tx = result.send();
      await signAndSubmitWithTimeout(tx, signer);

      onSuccess?.();
    },
    [core, isConnected, account, signer],
  );

  return { cancel };
}
