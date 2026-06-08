import { useCallback } from 'react';
import type { OrderTuple } from '@mercado/types';
import { decodeOrderTuple } from '@mercado/types';
import { useAuth } from '@mercado/core-hooks';

import { useContracts } from '../../contexts/ContractsContext';
import type { UseAdvanceOrderStatusResult } from '../../contexts/DataContext/DataContext';
import { signAndSubmitWithTimeout } from '../../lib/contracts';

// Status enum: PLACED=0, CONFIRMED=1, PREPARING=2, READY=3, DONE=4, CANCELED=5
const STATUS_INDEX: Record<string, number> = {
  PLACED: 0,
  CONFIRMED: 1,
  PREPARING: 2,
  READY_FOR_PICKUP: 3,
  COMPLETED: 4,
  CANCELED: 5,
};

/**
 * Real implementation of order status advancement using MercadoCore contract.
 *
 * Status flow: PLACED -> CONFIRMED -> PREPARING -> READY -> (customer calls complete)
 */
export function useRealAdvanceOrderStatus(): UseAdvanceOrderStatusResult {
  const { core, isConnected } = useContracts();
  const { account, signer } = useAuth();

  const advance = useCallback(
    async (orderId: string, onSuccess?: () => void) => {
      if (!core || !isConnected) {
        throw new Error('Contracts not connected');
      }
      if (!account || !signer) {
        throw new Error('Not signed in');
      }

      // Read current order status to determine action
      const orderResult = (await core.read('orders', [
        BigInt(orderId),
      ])) as OrderTuple;
      const decoded = decodeOrderTuple(orderResult);

      if (!decoded) {
        throw new Error('Order not found');
      }

      const statusIndex = STATUS_INDEX[decoded.status];

      if (statusIndex === 3) {
        // READY -> DONE (customer confirms pickup)
        const result = await core.write(
          'completeOrder',
          [BigInt(orderId)],
          account.address,
        );
        const tx = result.send();
        await signAndSubmitWithTimeout(tx, signer);
      } else if (statusIndex < 3) {
        // PLACED -> CONFIRMED -> PREPARING -> READY (restaurant advances)
        const result = await core.write(
          'advanceOrderStatus',
          [BigInt(orderId)],
          account.address,
        );
        const tx = result.send();
        await signAndSubmitWithTimeout(tx, signer);
      } else {
        throw new Error('Order cannot be advanced');
      }

      onSuccess?.();
    },
    [core, isConnected, account, signer],
  );

  return { advance };
}
