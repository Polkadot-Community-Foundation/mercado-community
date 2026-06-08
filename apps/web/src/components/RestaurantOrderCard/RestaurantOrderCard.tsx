import type { OrderStatus } from '../../types';
import { formatPrice } from '../../lib';

type RestaurantOrderCardProps = {
  orderId: string;
  customerAddress: string;
  totalPrice: bigint;
  status: OrderStatus;
  itemCount: number;
  canceledBy?: 'customer' | 'restaurant';
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

export function RestaurantOrderCard({
  orderId,
  customerAddress,
  totalPrice,
  status,
  itemCount,
  canceledBy,
  onClick,
}: RestaurantOrderCardProps) {
  const isCanceled = status === 'CANCELED';
  const displayStatus = STATUS_DISPLAY[status];

  return (
    <button
      onClick={onClick}
      className="card-interactive focus-ring flex w-full items-center justify-between rounded-lg border border-light-border bg-white px-4 py-3 text-left shadow-sm"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">
          {orderId}
        </p>
        <p className="text-xs text-text-tertiary">
          {customerAddress} &middot; {itemCount} item
          {itemCount !== 1 && 's'}
        </p>
      </div>
      <div className="ml-4 flex flex-col items-end gap-1">
        <span className="text-sm font-semibold text-text-primary">
          {formatPrice(totalPrice)}
        </span>
        <span
          className={`text-xs font-medium ${isCanceled ? 'text-error' : 'text-brand'}`}
        >
          {displayStatus}
          {isCanceled &&
            canceledBy &&
            ` by ${canceledBy === 'customer' ? 'the customer' : 'the restaurant'}`}
        </span>
      </div>
    </button>
  );
}
