import { useCallback } from 'react';
import { DisputeStatus, Verdict } from '@mercado/types';

import { useMockStore } from '../../stores';
import type { UseAcceptFaultResult } from '../../contexts/DataContext/DataContext';

export function useMockAcceptFault(): UseAcceptFaultResult {
  const { data, setData } = useMockStore();

  const acceptFault = useCallback(
    async (disputeId: string): Promise<void> => {
      if (!data.activeAccount) {
        throw new Error('Must be logged in to accept fault');
      }

      // Find the dispute
      const dispute = data.disputes.find((d) => d.id === disputeId);
      if (!dispute) {
        throw new Error('Dispute not found');
      }

      // Verify the restaurant owns this dispute
      const restaurant = data.restaurants.find(
        (r) => r.id === dispute.restaurantId,
      );
      if (!restaurant || restaurant.owner !== data.activeAccount.address) {
        throw new Error('Only the restaurant can accept fault');
      }

      // Check dispute is still open
      if (dispute.status !== DisputeStatus.OPEN) {
        throw new Error('Dispute is no longer open');
      }

      // Check no counter-evidence already submitted
      if (dispute.counterEvidenceCID) {
        throw new Error(
          'Cannot accept fault after submitting counter-evidence',
        );
      }

      // Accept fault: resolve dispute in customer's favor
      setData((prev) => ({
        ...prev,
        disputes: prev.disputes.map((d) =>
          d.id === disputeId
            ? {
                ...d,
                status: DisputeStatus.RESOLVED,
                verdict: Verdict.CustomerWins,
                faultAccepted: true,
                resolvedAt: Date.now(),
              }
            : d,
        ),
      }));
    },
    [data.activeAccount, data.disputes, data.restaurants, setData],
  );

  return { acceptFault };
}
