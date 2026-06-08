import { useCallback, useState, useEffect } from 'react';
import { DisputeOperationPhase } from '@mercado/types';
import { useAuth } from '@mercado/core-hooks';

import { useContracts } from '../../contexts/ContractsContext';
import { useBulletin } from '../useBulletin';
import type {
  UseRaiseDisputeResult,
  RaiseDisputeInput,
} from '../../contexts/DataContext/DataContext';
import { signAndSubmitWithTimeout } from '../../lib/contracts';

/** Phase labels for user-facing messages */
const PHASE_MESSAGES: Record<DisputeOperationPhase, string> = {
  [DisputeOperationPhase.IDLE]: '',
  [DisputeOperationPhase.UPLOADING_EVIDENCE]:
    'Uploading evidence to Bulletin Chain...',
  [DisputeOperationPhase.CREATING_DISPUTE]: 'Preparing dispute transaction...',
  [DisputeOperationPhase.SUBMITTING_TX]: 'Submitting transaction...',
  [DisputeOperationPhase.CONFIRMING]: 'Waiting for confirmation...',
  [DisputeOperationPhase.COMPLETE]: 'Dispute created successfully',
  [DisputeOperationPhase.ERROR]: 'Failed to create dispute',
};

/**
 * Real implementation of dispute raising using MercadoDisputes contract.
 * Supports progress callbacks for multi-step operation tracking.
 */
export function useRealRaiseDispute(): UseRaiseDisputeResult {
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

  const raiseDispute = useCallback(
    async (input: RaiseDisputeInput): Promise<string> => {
      const { onProgress } = input;
      const emit = (phase: DisputeOperationPhase) => {
        onProgress?.(phase, PHASE_MESSAGES[phase]);
      };

      if (!disputes || !isConnected) {
        emit(DisputeOperationPhase.ERROR);
        throw new Error('Contracts not connected');
      }
      if (!account || !signer) {
        emit(DisputeOperationPhase.ERROR);
        throw new Error('Not signed in');
      }

      try {
        // Phase 1: Upload evidence
        emit(DisputeOperationPhase.UPLOADING_EVIDENCE);
        const evidenceCID = await uploadEvidence(
          {
            version: '1.0',
            title: input.title,
            description: input.description,
            disputeType: input.reason,
            submittedBy: input.initiator || 'customer',
            timestamp: Date.now(),
          },
          input.photos,
        );

        // Phase 2: Prepare transaction
        emit(DisputeOperationPhase.CREATING_DISPUTE);
        const result = await disputes.write<bigint>(
          'raiseDispute',
          [BigInt(input.orderId), evidenceCID],
          account.address,
          stakeAmount,
        );

        // Phase 3: Submit transaction
        emit(DisputeOperationPhase.SUBMITTING_TX);
        const tx = result.send();

        // Phase 4: Wait for confirmation
        emit(DisputeOperationPhase.CONFIRMING);
        await signAndSubmitWithTimeout(tx, signer);

        // Phase 5: Complete
        emit(DisputeOperationPhase.COMPLETE);
        return result.response.toString();
      } catch (err) {
        emit(DisputeOperationPhase.ERROR);
        throw err;
      }
    },
    [disputes, isConnected, account, signer, uploadEvidence, stakeAmount],
  );

  return { raiseDispute, stakeAmount };
}
