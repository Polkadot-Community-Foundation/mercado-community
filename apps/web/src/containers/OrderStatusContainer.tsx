import { useState } from 'react';
import { useParams } from 'react-router';

import {
  useOrder,
  useAdvanceOrderStatus,
  useRestaurant,
  useCancelOrder,
  useRateRestaurant,
  useCompleteOrder,
} from '../hooks';
import { OrderStatusCard } from '../components';
import { resolveOrderItem, isDisputeWindowOpen } from '../lib';

import { RaiseDisputeContainer } from './RaiseDisputeContainer';

export function OrderStatusContainer() {
  const { orderId } = useParams<{ orderId: string }>();
  const { order, isLoading: isOrderLoading } = useOrder(orderId ?? '');
  const { advance } = useAdvanceOrderStatus();
  const { cancel } = useCancelOrder();
  const { complete } = useCompleteOrder();
  const { rateRestaurant } = useRateRestaurant();
  const { restaurant } = useRestaurant(order?.restaurantId ?? '');
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pickupCodeInput, setPickupCodeInput] = useState('');
  const [pickupError, setPickupError] = useState<string | null>(null);

  const handleRate = async (rating: number) => {
    if (!order) return;
    setRatingError(null);
    try {
      await rateRestaurant(order.id, rating);
    } catch (err) {
      setRatingError(
        err instanceof Error ? err.message : 'Failed to submit rating',
      );
    }
  };

  const handlePickedUp = async () => {
    if (!order) return;
    setIsProcessing(true);
    setPickupError(null);
    try {
      // If order has pickup code, use complete() with the code
      // Otherwise use advance() for orders without pickup code (legacy support)
      if (order.pickupCodeHash) {
        await complete(order.id, pickupCodeInput);
      } else {
        await advance(order.id);
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('pickup code')) {
        setPickupError(err.message);
      } else {
        setPickupError('Failed to complete order');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setIsProcessing(true);
    try {
      await cancel(order.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const resolvedItems =
    restaurant && order
      ? order.items.map((item) => resolveOrderItem(item, restaurant))
      : [];

  // Check if order can be disputed
  const isCompleted = order?.status === 'COMPLETED';
  const hasNoDispute = !order?.disputeId;
  const withinDisputeWindow = isDisputeWindowOpen(order?.completedAt);
  const canRaiseDispute = isCompleted && hasNoDispute && withinDisputeWindow;

  // Determine reason if dispute unavailable
  const disputeUnavailableReason = isCompleted
    ? !hasNoDispute
      ? ('already_disputed' as const)
      : !withinDisputeWindow && order?.completedAt
        ? ('window_expired' as const)
        : undefined
    : undefined;

  return (
    <OrderStatusCard
      order={order}
      restaurantName={restaurant?.name ?? 'Unknown'}
      resolvedItems={resolvedItems}
      onPickedUp={handlePickedUp}
      onCancel={
        order?.status !== 'COMPLETED' && order?.status !== 'CANCELED'
          ? handleCancel
          : undefined
      }
      isProcessing={isProcessing}
      isLoading={isOrderLoading}
      canRaiseDispute={canRaiseDispute}
      disputeUnavailableReason={disputeUnavailableReason}
      onRaiseDispute={() => setShowDisputeForm(true)}
      showDisputeForm={showDisputeForm}
      onBackFromDispute={() => setShowDisputeForm(false)}
      disputeFormContent={
        order && (
          <RaiseDisputeContainer
            orderId={order.id}
            onCancel={() => setShowDisputeForm(false)}
          />
        )
      }
      currentRating={order?.restaurantRating}
      onRate={handleRate}
      ratingError={ratingError}
      pickupCodeInput={pickupCodeInput}
      onPickupCodeChange={setPickupCodeInput}
      pickupError={pickupError}
    />
  );
}
