import { useMemo, useEffect } from 'react';
import { DisputeStatus, Verdict } from '@mercado/types';

import { useMockStore } from '../../stores';
import type { UseRestaurantDisputesResult } from '../../contexts/DataContext/DataContext';

const RESPONSE_WINDOW_MS = 24 * 60 * 60 * 1000;

export function useMockRestaurantDisputes(): UseRestaurantDisputesResult {
  const { data, setData } = useMockStore();

  // Auto-resolve expired disputes (24h with no response)
  useEffect(() => {
    const now = Date.now();
    const expiredDisputes = data.disputes.filter(
      (d) =>
        d.status === DisputeStatus.OPEN &&
        !d.counterEvidenceCID &&
        !d.faultAccepted &&
        now - d.createdAt > RESPONSE_WINDOW_MS,
    );

    if (expiredDisputes.length > 0) {
      setData((prev) => ({
        ...prev,
        disputes: prev.disputes.map((d) =>
          expiredDisputes.some((e) => e.id === d.id)
            ? {
                ...d,
                status: DisputeStatus.RESOLVED,
                verdict: Verdict.CustomerWins,
                resolvedAt: now,
              }
            : d,
        ),
      }));
    }
  }, [data.disputes, setData]);

  return useMemo(() => {
    if (!data.activeAccount) {
      return { disputes: [] };
    }

    const ownedRestaurant = data.restaurants.find(
      (r) => r.owner === data.activeAccount?.address,
    );

    if (!ownedRestaurant) {
      return { disputes: [] };
    }

    const now = Date.now();
    const restaurantDisputes = data.disputes
      .filter((d) => d.restaurantId === ownedRestaurant.id)
      .map((dispute) => ({
        dispute,
        customerAddress: dispute.customerId,
        responseWindowExpired:
          dispute.status === DisputeStatus.OPEN &&
          !dispute.counterEvidenceCID &&
          !dispute.faultAccepted &&
          now - dispute.createdAt > RESPONSE_WINDOW_MS,
      }))
      .sort((a, b) => b.dispute.createdAt - a.dispute.createdAt);

    return { disputes: restaurantDisputes };
  }, [data.activeAccount, data.disputes, data.restaurants]);
}
