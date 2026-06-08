import { formatPrice } from '../../../lib/format';

type StakeDisplayProps = {
  initiatorStake: bigint;
  challengerStake?: bigint;
  faultAccepted?: boolean;
  compact?: boolean;
};

export function StakeDisplay({
  initiatorStake,
  challengerStake = 0n,
  faultAccepted = false,
  compact = false,
}: StakeDisplayProps) {
  const containerClass = compact
    ? 'space-y-1.5'
    : 'p-3 bg-light-secondary rounded-lg space-y-2';
  const textSizeClass = compact ? 'text-xs' : 'text-sm';
  const titleClass = compact
    ? ''
    : 'text-sm font-medium text-text-primary mb-2';

  return (
    <div className={containerClass}>
      {!compact && <p className={titleClass}>Stake Information</p>}
      <div className={`flex items-center justify-between ${textSizeClass}`}>
        <span className="text-text-secondary">Initiator staked:</span>
        <span className={`font-semibold ${compact ? 'text-text-primary' : ''}`}>
          {formatPrice(initiatorStake)}
        </span>
      </div>
      {challengerStake > 0n && (
        <div className={`flex items-center justify-between ${textSizeClass}`}>
          <span className="text-text-secondary">Challenger staked:</span>
          <span
            className={`font-semibold ${compact ? 'text-text-primary' : ''}`}
          >
            {formatPrice(challengerStake)}
          </span>
        </div>
      )}
      {faultAccepted && (
        <div
          className={`flex items-center gap-1.5 text-success font-medium pt-1 ${textSizeClass}`}
        >
          <CheckIcon />
          <span>Fault accepted - dispute resolved</span>
        </div>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.5 4.5L6 12L2.5 8.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
