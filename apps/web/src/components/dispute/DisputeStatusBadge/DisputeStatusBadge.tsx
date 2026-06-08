import { DisputeStatus, Verdict } from '@mercado/types';

type DisputeStatusBadgeProps = {
  status: DisputeStatus;
  verdict: Verdict;
  size?: 'sm' | 'md';
};

export function DisputeStatusBadge({
  status,
  verdict,
  size = 'md',
}: DisputeStatusBadgeProps) {
  const { label, className } = getStatusDisplay(status, verdict);

  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses} ${className}`}
    >
      {label}
    </span>
  );
}

function getStatusDisplay(
  status: DisputeStatus,
  verdict: Verdict,
): { label: string; className: string } {
  if (status === DisputeStatus.OPEN) {
    return {
      label: 'Open',
      className: 'bg-warning/20 text-warning',
    };
  }

  // Resolved
  switch (verdict) {
    case Verdict.CustomerWins:
      return {
        label: 'Customer Wins',
        className: 'bg-success/20 text-success',
      };
    case Verdict.RestaurantWins:
      return {
        label: 'Restaurant Wins',
        className: 'bg-info/20 text-info',
      };
    default:
      return {
        label: 'Resolved',
        className: 'bg-light-secondary text-text-primary',
      };
  }
}
