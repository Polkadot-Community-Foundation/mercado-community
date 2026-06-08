import { useCallback } from 'react';
import { DisputeStatus } from '@mercado/types';

import { useMockStore } from '../../stores';
import type {
  UseAddCounterEvidenceResult,
  AddCounterEvidenceInput,
} from '../../contexts/DataContext/DataContext';
import { useMockBulletin } from '../useBulletin/useMockBulletin';

export function useMockAddCounterEvidence(): UseAddCounterEvidenceResult {
  const { data, setData } = useMockStore();
  const { uploadEvidence } = useMockBulletin();

  const addCounterEvidence = useCallback(
    async (input: AddCounterEvidenceInput): Promise<void> => {
      if (!data.activeAccount) {
        throw new Error('Must be logged in to add counter-evidence');
      }

      // Find the dispute
      const dispute = data.disputes.find((d) => d.id === input.disputeId);
      if (!dispute) {
        throw new Error('Dispute not found');
      }

      // Verify the restaurant owns this dispute
      const restaurant = data.restaurants.find(
        (r) => r.id === dispute.restaurantId,
      );
      if (!restaurant || restaurant.owner !== data.activeAccount.address) {
        throw new Error('Only the restaurant can add counter-evidence');
      }

      // Check dispute is still open
      if (dispute.status !== DisputeStatus.OPEN) {
        throw new Error('Dispute is no longer open');
      }

      // Check no counter-evidence already exists
      if (dispute.counterEvidenceCID) {
        throw new Error('Counter-evidence already submitted');
      }

      // Check fault not already accepted
      if (dispute.faultAccepted) {
        throw new Error('Fault has already been accepted');
      }

      // Upload counter-evidence to "Bulletin Chain"
      const counterEvidenceCID = await uploadEvidence(
        {
          version: '1.0',
          title: input.title,
          description: input.description,
          submittedBy: 'restaurant',
          timestamp: Date.now(),
        },
        input.photos,
      );

      // Update the dispute with counter-evidence and stake
      setData((prev) => ({
        ...prev,
        disputes: prev.disputes.map((d) =>
          d.id === input.disputeId
            ? {
                ...d,
                counterEvidenceCID,
                challengerStake: prev.stakeAmount,
              }
            : d,
        ),
      }));
    },
    [
      data.activeAccount,
      data.disputes,
      data.restaurants,
      setData,
      uploadEvidence,
    ],
  );

  return {
    addCounterEvidence,
    stakeAmount: data.stakeAmount,
  };
}
