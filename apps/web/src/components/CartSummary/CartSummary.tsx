import type { ResolvedOrderItem } from '../../lib';
import { formatPrice } from '../../lib';

type CartSummaryProps = {
  items: ResolvedOrderItem[];
  subtotal: bigint;
  feeAmount?: bigint;
  feePercentage?: number; // basis points
  total: bigint;
  restaurantName: string;
  onConfirm: () => void;
  isLoading?: boolean;
  error?: string | null;
  /** Disable confirm button (e.g., when cart has stale items) */
  disabled?: boolean;
};

export function CartSummary({
  items,
  subtotal,
  feeAmount,
  feePercentage,
  total,
  restaurantName,
  onConfirm,
  isLoading = false,
  error,
  disabled = false,
}: CartSummaryProps) {
  const showFee = feeAmount !== undefined && feeAmount > 0n;
  return (
    <div className="rounded-xl border border-light-border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-text-primary">Your Order</h2>
      <p className="mt-1 text-sm text-text-secondary">from {restaurantName}</p>

      <div className="mt-4 flex flex-col gap-3">
        {items.map((item, i) => (
          <div
            key={`${item.dishId}-${i}`}
            className="flex items-start justify-between border-b border-light-tertiary pb-3 last:border-0"
          >
            <div>
              <p className="font-medium text-text-primary">{item.dishName}</p>
              {item.selectedOptions.length > 0 && (
                <p className="mt-1 text-xs text-text-tertiary">
                  {item.selectedOptions.map((o) => o.name).join(', ')}
                </p>
              )}
            </div>
            <span className="shrink-0 font-medium text-text-primary">
              {formatPrice(item.itemTotal)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-light-border pt-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Subtotal</span>
          <span className="text-text-primary">{formatPrice(subtotal)}</span>
        </div>
        {showFee && (
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">
              Platform fee ({feePercentage ? feePercentage / 100 : 0}%)
            </span>
            <span className="text-text-primary">{formatPrice(feeAmount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-light-tertiary">
          <span className="text-lg font-bold text-text-primary">Total</span>
          <span className="text-lg font-bold text-text-primary">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-error/10 p-3 text-sm text-error">
          {error}
        </div>
      )}

      <button
        onClick={onConfirm}
        disabled={isLoading || disabled}
        className="btn-tactile focus-ring bg-gradient-brand mt-6 w-full rounded-lg px-4 py-3 font-medium text-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Placing Order...' : 'Place Order'}
      </button>
    </div>
  );
}
