import type { ReactNode } from 'react';

import type { Order } from '../../types';
import type { ResolvedOrderItem } from '../../lib';
import { formatPrice } from '../../lib';
import { RateRestaurant } from '../RateRestaurant';
import { LoadingSpinner } from '../LoadingSpinner';

type OrderStatusCardProps = {
  order?: Order;
  restaurantName: string;
  resolvedItems: ResolvedOrderItem[];
  onPickedUp?: () => void;
  onCancel?: () => void;
  onRaiseDispute?: () => void;
  canRaiseDispute?: boolean;
  disputeUnavailableReason?: 'window_expired' | 'already_disputed';
  currentRating?: number;
  onRate?: (rating: number) => void;
  ratingError?: string | null;
  isProcessing?: boolean;
  isLoading?: boolean;
  showDisputeForm?: boolean;
  onBackFromDispute?: () => void;
  disputeFormContent?: ReactNode;
  /** Pickup code input value */
  pickupCodeInput?: string;
  /** Handler for pickup code input changes */
  onPickupCodeChange?: (code: string) => void;
  /** Error message for pickup code */
  pickupError?: string | null;
};

const STATUS_STEPS = [
  'PLACED',
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'COMPLETED',
] as const;

const STATUS_LABELS: Record<string, string> = {
  PLACED: 'Placed',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY_FOR_PICKUP: 'Ready for Pickup',
  COMPLETED: 'Completed',
  CANCELED: 'Canceled',
};

export function OrderStatusCard({
  order,
  restaurantName,
  resolvedItems,
  onPickedUp,
  onCancel,
  onRaiseDispute,
  canRaiseDispute = false,
  disputeUnavailableReason,
  currentRating,
  onRate,
  ratingError,
  isProcessing = false,
  isLoading = false,
  showDisputeForm = false,
  onBackFromDispute,
  disputeFormContent,
  pickupCodeInput = '',
  onPickupCodeChange,
  pickupError,
}: OrderStatusCardProps) {
  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <LoadingSpinner />
        <p className="mt-2 text-text-secondary">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <p className="py-12 text-center text-text-tertiary">Order not found.</p>
    );
  }

  if (showDisputeForm && disputeFormContent) {
    return (
      <div className="space-y-4">
        <button
          onClick={onBackFromDispute}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
        >
          &larr; Back to order
        </button>
        <h2 className="text-lg font-bold text-text-primary">
          Report a Problem
        </h2>
        {disputeFormContent}
      </div>
    );
  }

  const currentIdx = (STATUS_STEPS as readonly string[]).indexOf(order.status);
  const isCanceled = order.status === 'CANCELED';
  const isTerminal = isCanceled || order.status === 'COMPLETED';

  return (
    <div className="rounded-2xl border border-light-border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-text-primary">Order Status</h2>
      <p className="mt-1 text-sm text-text-secondary">from {restaurantName}</p>

      <div className="mt-4 flex flex-col gap-3">
        {resolvedItems.map((item, i) => (
          <div
            key={`${item.dishId}-${i}`}
            className="flex items-start justify-between"
          >
            <div>
              <p className="text-sm font-medium text-text-primary">
                {item.dishName}
              </p>
              {item.selectedOptions.length > 0 && (
                <p className="text-xs text-text-tertiary">
                  {item.selectedOptions.map((o) => o.name).join(', ')}
                </p>
              )}
            </div>
            <span className="text-sm text-text-secondary">
              {formatPrice(item.itemTotal)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 border-t border-light-border pt-3 space-y-1">
        {order.matchmakerFeeAmount && order.matchmakerFeeAmount > 0n && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Subtotal</span>
              <span className="text-text-secondary">
                {formatPrice(order.totalPrice - order.matchmakerFeeAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">
                Platform fee
                {order.matchmakerFeeSnapshot &&
                  ` (${order.matchmakerFeeSnapshot / 100}%)`}
              </span>
              <span className="text-text-secondary">
                {formatPrice(order.matchmakerFeeAmount)}
              </span>
            </div>
          </>
        )}
        <div className="flex items-center justify-between">
          <span className="font-bold text-text-primary">Total</span>
          <span className="font-bold text-text-primary">
            {formatPrice(order.totalPrice)}
          </span>
        </div>
      </div>

      {isCanceled ? (
        <div className="mt-6 rounded-lg bg-error/10 p-4 text-center">
          <span className="font-semibold text-error">Canceled</span>
          <p className="mt-1 text-sm text-error/80">
            {order.canceledBy === 'customer'
              ? 'You have cancelled the order'
              : 'Canceled by the restaurant'}
          </p>
        </div>
      ) : (
        <div className="mt-6 flex items-center gap-1">
          {STATUS_STEPS.map((step, i) => {
            const done = i <= currentIdx;
            return (
              <div
                key={step}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <div
                  className={`h-2 w-full rounded-full transition-colors duration-200 ${done ? 'bg-gradient-brand' : 'bg-light-tertiary'}`}
                />
                <span
                  className={`whitespace-nowrap text-xs ${done ? 'font-medium text-brand' : 'text-text-tertiary'}`}
                >
                  {STATUS_LABELS[step]}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {order.status === 'COMPLETED' && onRate && (
        <div className="mt-6">
          <RateRestaurant currentRating={currentRating} onSubmit={onRate} />
          {ratingError && (
            <p className="mt-2 text-center text-sm text-error">{ratingError}</p>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2">
        {order.status === 'READY_FOR_PICKUP' && onPickedUp && (
          <div className="space-y-2">
            {order.pickupCodeHash && onPickupCodeChange && (
              <div>
                <label
                  htmlFor="pickup-code"
                  className="block text-sm font-medium text-text-secondary mb-1"
                >
                  Enter pickup code from restaurant
                </label>
                <input
                  id="pickup-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={pickupCodeInput}
                  onChange={(e) => onPickupCodeChange(e.target.value)}
                  placeholder="000000"
                  className="w-full rounded-lg border border-light-border px-4 py-2 text-center text-lg font-mono tracking-widest focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  disabled={isProcessing}
                />
                {pickupError && (
                  <p className="mt-1 text-sm text-error">{pickupError}</p>
                )}
              </div>
            )}
            <button
              onClick={onPickedUp}
              disabled={
                isProcessing ||
                (!!order.pickupCodeHash && pickupCodeInput.length !== 6)
              }
              className="btn-tactile focus-ring w-full rounded-xl bg-success px-4 py-3 font-semibold text-white hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Confirm Pickup'}
            </button>
          </div>
        )}
        {!isTerminal && onCancel && (
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="btn-tactile focus-ring w-full rounded-xl border-2 border-error/40 px-4 py-2.5 text-sm font-medium text-error hover:bg-error/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Cancel order'}
          </button>
        )}
        {order.status === 'COMPLETED' && canRaiseDispute && onRaiseDispute && (
          <button
            onClick={onRaiseDispute}
            className="btn-tactile focus-ring w-full rounded-xl border-2 border-warning px-4 py-2.5 text-sm font-medium text-warning hover:bg-warning/10"
          >
            Something went wrong?
          </button>
        )}
        {order.status === 'COMPLETED' &&
          !canRaiseDispute &&
          disputeUnavailableReason && (
            <p className="text-center text-xs text-text-tertiary">
              {disputeUnavailableReason === 'window_expired'
                ? 'The 24-hour window to report issues has expired.'
                : 'A dispute has already been raised for this order.'}
            </p>
          )}
      </div>
    </div>
  );
}
