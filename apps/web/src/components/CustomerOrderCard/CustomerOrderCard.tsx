import type { OrderStatus } from '../../types';
import { formatPrice } from '../../lib';

type CustomerOrderCardProps = {
  restaurantName: string;
  totalPrice: bigint;
  status: OrderStatus;
  itemCount: number;
  canceledBy?: 'customer' | 'restaurant';
  hasDispute?: boolean;
  onClick: () => void;
};

const STATUS_DISPLAY: Record<OrderStatus, string> = {
  PLACED: 'new',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY_FOR_PICKUP: 'ready for pickup',
  COMPLETED: 'completed',
  CANCELED: 'canceled',
};

export function CustomerOrderCard({
  restaurantName,
  totalPrice,
  status,
  itemCount,
  canceledBy,
  hasDispute = false,
  onClick,
}: CustomerOrderCardProps) {
  const isCanceled = status === 'CANCELED';
  const displayStatus = hasDispute ? 'disputed' : STATUS_DISPLAY[status];

  return (
    <button
      onClick={onClick}
      className="btn-tactile focus-ring flex w-full items-center justify-between rounded-xl border border-light-border bg-white px-4 py-3.5 text-left shadow-sm hover:shadow-md hover:border-brand-light/50"
      aria-label={restaurantName}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">
          {restaurantName}
        </p>
        <p className="text-xs text-text-tertiary">
          {itemCount} item{itemCount !== 1 && 's'}
        </p>
      </div>
      <div className="ml-4 flex flex-col items-end gap-1">
        <span className="text-sm font-semibold text-text-primary">
          {formatPrice(totalPrice)}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            isCanceled
              ? 'bg-error/10 text-error'
              : hasDispute
                ? 'bg-warning/10 text-warning'
                : status === 'COMPLETED'
                  ? 'bg-success/10 text-success'
                  : 'bg-brand-faded text-brand'
          }`}
        >
          {displayStatus}
          {isCanceled &&
            canceledBy &&
            ` by ${canceledBy === 'customer' ? 'you' : 'restaurant'}`}
        </span>
      </div>
    </button>
  );
}
