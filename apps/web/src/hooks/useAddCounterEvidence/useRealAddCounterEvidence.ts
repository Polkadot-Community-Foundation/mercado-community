import { useCallback, useState, useEffect } from 'react';
import { useAuth } from '@mercado/core-hooks';

import { useContracts } from '../../contexts/ContractsContext';
import { useBulletin } from '../useBulletin';
import type {
  UseAddCounterEvidenceResult,
  AddCounterEvidenceInput,
} from '../../contexts/DataContext/DataContext';
import { signAndSubmitWithTimeout } from '../../lib/contracts';

/**
 * Real implementation of adding counter-evidence using MercadoDisputes contract.
 */
export function useRealAddCounterEvidence(): UseAddCounterEvidenceResult {
  const { disputes, isConnected } = useContracts();
  const { account, signer } = useAuth();
  const { uploadEvidence } = useBulletin();
  const [stakeAmount, setStakeAmount] = useState<bigint>(1000000000000000000n);

  // Fetch stake amount from contract
  useEffect(() => {
    if (!disputes || !isConnected) return;

    disputes
      .read<bigint>('stakeAmount')
      .then((amount) => setStakeAmount(amount))
      .catch(console.error);
  }, [disputes, isConnected]);

  const addCounterEvidence = useCallback(
    async (input: AddCounterEvidenceInput): Promise<void> => {
      if (!disputes || !isConnected) {
        throw new Error('Contracts not connected');
      }
      if (!account || !signer) {
        throw new Error('Not signed in');
      }

      // Upload counter-evidence to Bulletin Chain
      const counterCID = await uploadEvidence(
        {
          version: '1.0',
          title: input.title,
          description: input.description,
          submittedBy: 'restaurant', // Counter-evidence is always from the restaurant (responding to customer disputes)
          timestamp: Date.now(),
        },
        input.photos,
      );

      // Dry-run the transaction with stake value
      const result = await disputes.write(
        'addCounterEvidence',
        [BigInt(input.disputeId), counterCID],
        account.address,
        stakeAmount,
      );

      // Submit the transaction
      const tx = result.send();
      await signAndSubmitWithTimeout(tx, signer);
    },
    [disputes, isConnected, account, signer, uploadEvidence, stakeAmount],
  );

  return { addCounterEvidence, stakeAmount };
}
