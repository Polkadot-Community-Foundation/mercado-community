import { useCallback } from 'react';
import { DisputeStatus, Verdict, type Dispute } from '@mercado/types';

import { useMockStore } from '../../stores';
import type {
  UseRaiseDisputeResult,
  RaiseDisputeInput,
} from '../../contexts/DataContext/DataContext';
import { useMockBulletin } from '../useBulletin/useMockBulletin';
import { isDisputeWindowOpen } from '../../lib';

export function useMockRaiseDispute(): UseRaiseDisputeResult {
  const { data, setData } = useMockStore();
  const { uploadEvidence } = useMockBulletin();

  const raiseDispute = useCallback(
    async (input: RaiseDisputeInput): Promise<string> => {
      if (!data.activeAccount) {
        throw new Error('Must be logged in to raise a dispute');
      }

      const initiator = input.initiator || 'customer';

      // Find the order
      const order = data.orders.find((o) => o.id === input.orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Verify ownership based on initiator type
      if (initiator === 'customer') {
        if (order.customerId !== data.activeAccount.address) {
          throw new Error('You can only dispute your own orders');
        }
      } else {
        // Restaurant initiating - check they own the restaurant
        const restaurant = data.restaurants.find(
          (r) => r.id === order.restaurantId,
        );
        if (!restaurant || restaurant.owner !== data.activeAccount.address) {
          throw new Error('You can only dispute orders for your restaurant');
        }
      }

      // Check order is completed
      if (order.status !== 'COMPLETED') {
        throw new Error('Can only dispute completed orders');
      }

      // Check within dispute window
      if (!isDisputeWindowOpen(order.completedAt)) {
        throw new Error('Dispute window has expired (24 hours)');
      }

      // Check no existing dispute
      const existingDispute = data.disputes.find(
        (d) => d.orderId === input.orderId,
      );
      if (existingDispute) {
        throw new Error('A dispute already exists for this order');
      }

      // Upload evidence to "Bulletin Chain"
      const evidenceCID = await uploadEvidence(
        {
          version: '1.0',
          title: input.title,
          description: input.description,
          disputeType: input.reason,
          submittedBy: initiator,
          timestamp: Date.now(),
        },
        input.photos,
      );

      // Create the dispute
      const disputeId = crypto.randomUUID();
      const dispute: Dispute = {
        id: disputeId,
        orderId: input.orderId,
        customerId: order.customerId,
        restaurantId: order.restaurantId,
        status: DisputeStatus.OPEN,
        verdict: Verdict.Pending,
        initiatorEvidenceCID: evidenceCID,
        initiatorStake: data.stakeAmount,
        challengerStake: 0n,
        faultAccepted: false,
        initiator,
        createdAt: Date.now(),
      };

      // Update state: add dispute and link to order
      setData((prev) => ({
        ...prev,
        disputes: [...prev.disputes, dispute],
        orders: prev.orders.map((o) =>
          o.id === input.orderId ? { ...o, disputeId } : o,
        ),
      }));

      return disputeId;
    },
    [
      data.activeAccount,
      data.orders,
      data.restaurants,
      data.disputes,
      data.stakeAmount,
      setData,
      uploadEvidence,
    ],
  );

  return {
    raiseDispute,
    stakeAmount: data.stakeAmount,
  };
}
