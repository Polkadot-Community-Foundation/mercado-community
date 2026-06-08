import type { DisputeReason } from '@mercado/types';

type ReasonOption = {
  value: DisputeReason;
  label: string;
  description: string;
};

const CUSTOMER_DISPUTE_REASONS: ReasonOption[] = [
  {
    value: 'wrong_items',
    label: 'Wrong Items',
    description: 'Received different items than ordered',
  },
  {
    value: 'incomplete_order',
    label: 'Incomplete Order',
    description: 'Missing items from the order',
  },
  {
    value: 'food_quality',
    label: 'Food Quality',
    description: 'Food was cold, spoiled, or poor quality',
  },
  {
    value: 'not_ready',
    label: 'Not Ready',
    description: 'Order was not ready at specified time',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Other issues with the order',
  },
];

const RESTAURANT_DISPUTE_REASONS: ReasonOption[] = [
  {
    value: 'customer_no_show',
    label: 'Customer No-Show',
    description: 'Customer did not pick up their order',
  },
  {
    value: 'order_rejected',
    label: 'Order Rejected',
    description: 'Customer rejected the order without valid reason',
  },
  {
    value: 'payment_issue',
    label: 'Payment Issue',
    description: 'Problem with payment or suspected fraud',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Other issues with the customer',
  },
];

type DisputeReasonSelectorProps = {
  value: DisputeReason | null;
  onChange: (reason: DisputeReason) => void;
  initiator?: 'customer' | 'restaurant';
  disabled?: boolean;
};

export function DisputeReasonSelector({
  value,
  onChange,
  initiator = 'customer',
  disabled = false,
}: DisputeReasonSelectorProps) {
  const reasons =
    initiator === 'restaurant'
      ? RESTAURANT_DISPUTE_REASONS
      : CUSTOMER_DISPUTE_REASONS;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text-primary">
        What went wrong? *
      </label>
      <div className="space-y-2">
        {reasons.map((reason) => (
          <label
            key={reason.value}
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
              value === reason.value
                ? 'border-brand bg-brand-faded'
                : 'border-light-border hover:border-brand-faded'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              type="radio"
              name="disputeReason"
              value={reason.value}
              checked={value === reason.value}
              onChange={() => onChange(reason.value)}
              disabled={disabled}
              className="mt-1 h-4 w-4 text-brand focus:ring-brand"
            />
            <div>
              <span className="block font-medium text-text-primary">
                {reason.label}
              </span>
              <span className="block text-sm text-text-secondary">
                {reason.description}
              </span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
