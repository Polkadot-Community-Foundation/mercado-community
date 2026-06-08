import * as Dialog from '@radix-ui/react-dialog';

import type { Order } from '../../types';
import type { ResolvedOrderItem } from '../../lib';
import { formatPrice } from '../../lib';

type RestaurantOrderDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  customerAddress: string;
  resolvedItems: ResolvedOrderItem[];
  advanceLabel?: string;
  onAdvance?: () => void;
  onCancel?: () => void;
  onRaiseDispute?: () => void;
  canDispute?: boolean;
  /** Pickup code to display (shown when order is ready for pickup) */
  pickupCode?: string;
  /** Whether an action is being processed */
  isProcessing?: boolean;
};

export function RestaurantOrderDetailModal({
  isOpen,
  onClose,
  order,
  customerAddress,
  resolvedItems,
  advanceLabel,
  onAdvance,
  onCancel,
  onRaiseDispute,
  canDispute = false,
  pickupCode,
  isProcessing = false,
}: RestaurantOrderDetailModalProps) {
  const isCanceled = order.status === 'CANCELED';
  const isCompleted = order.status === 'COMPLETED';
  const isTerminal = isCanceled || isCompleted;

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed top-1/2 left-1/2 z-50 mx-4 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-light-border bg-white p-6 shadow-xl"
        >
          <Dialog.Title className="text-xl font-bold text-text-primary">
            Order {order.id}
          </Dialog.Title>
          <p className="mt-1 text-sm text-text-secondary">
            Customer: {customerAddress}
          </p>

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

          <div className="mt-3 flex items-center justify-between border-t border-light-border pt-3">
            <span className="font-bold text-text-primary">Total</span>
            <span className="font-bold text-text-primary">
              {formatPrice(order.totalPrice)}
            </span>
          </div>

          {isCanceled && (
            <div className="mt-4 rounded-lg bg-error/10 p-3 text-center">
              <span className="text-sm font-medium text-error">
                {order.canceledBy === 'customer'
                  ? 'Canceled by the customer'
                  : 'Canceled by the restaurant'}
              </span>
            </div>
          )}

          {order.status === 'READY_FOR_PICKUP' && pickupCode && (
            <div className="mt-4 rounded-lg bg-success/10 p-4 text-center">
              <p className="text-sm font-medium text-success">
                Ready for Pickup
              </p>
              <p className="mt-2 text-xs text-text-secondary">
                Give this code to the customer:
              </p>
              <p className="mt-1 font-mono text-2xl font-bold tracking-widest text-success">
                {pickupCode}
              </p>
            </div>
          )}

          {isCompleted && canDispute && onRaiseDispute && (
            <div className="mt-4">
              <button
                onClick={onRaiseDispute}
                className="btn-tactile focus-ring w-full rounded-lg border-2 border-warning px-4 py-2 text-sm font-medium text-warning hover:bg-warning/10"
              >
                Raise Dispute (Customer No-Show, etc.)
              </button>
            </div>
          )}

          {!isTerminal && (
            <div className="mt-6 flex gap-3">
              {onCancel && (
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        'Are you sure you want to cancel this order?',
                      )
                    ) {
                      onCancel();
                    }
                  }}
                  className="btn-tactile focus-ring flex-1 rounded-lg border-2 border-error/60 px-4 py-2 text-sm font-medium text-error hover:bg-error/10"
                >
                  Cancel order
                </button>
              )}
              {onAdvance && advanceLabel && (
                <button
                  onClick={onAdvance}
                  disabled={isProcessing}
                  className="btn-tactile focus-ring bg-gradient-brand flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : advanceLabel}
                </button>
              )}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
