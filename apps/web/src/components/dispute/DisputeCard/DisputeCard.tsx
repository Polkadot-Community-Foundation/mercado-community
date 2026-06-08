import type { Dispute } from '@mercado/types';

import { DisputeStatusBadge } from '../DisputeStatusBadge';
import { StakeDisplay } from '../StakeDisplay';

type DisputeCardProps = {
  dispute: Dispute;
  restaurantName?: string;
  onViewDetails?: () => void;
  showActions?: boolean;
  onRespond?: () => void;
  onAcceptFault?: () => void;
  responseWindowExpired?: boolean;
};

export function DisputeCard({
  dispute,
  restaurantName,
  onViewDetails,
  showActions = false,
  onRespond,
  onAcceptFault,
  responseWindowExpired = false,
}: DisputeCardProps) {
  const createdDate = new Date(dispute.createdAt).toLocaleDateString();
  const createdTime = new Date(dispute.createdAt).toLocaleTimeString();
  const isOpen = dispute.status === 0; // DisputeStatus.OPEN
  const hasCounterEvidence = !!dispute.counterEvidenceCID;

  return (
    <div className="card-interactive rounded-xl border border-light-border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-text-primary">
              Order #{dispute.orderId.slice(0, 8)}
            </span>
            <DisputeStatusBadge
              status={dispute.status}
              verdict={dispute.verdict}
              size="sm"
            />
          </div>
          {restaurantName && (
            <p className="text-sm text-text-secondary">{restaurantName}</p>
          )}
        </div>
        <div className="text-right text-xs text-text-tertiary">
          <div>{createdDate}</div>
          <div>{createdTime}</div>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-sm text-text-secondary">
          Initiated by:{' '}
          <span className="text-text-primary capitalize">
            {dispute.initiator}
          </span>
        </p>
        {hasCounterEvidence && (
          <p className="text-sm text-text-secondary">
            Status: <span className="text-text-primary">Under review</span>
          </p>
        )}
        {isOpen && !hasCounterEvidence && (
          <p className="text-sm text-text-secondary">
            Status:{' '}
            <span
              className={responseWindowExpired ? 'text-error' : 'text-warning'}
            >
              {responseWindowExpired
                ? 'Response window expired'
                : 'Waiting for response'}
            </span>
          </p>
        )}
      </div>

      <StakeDisplay
        initiatorStake={dispute.initiatorStake}
        challengerStake={dispute.challengerStake}
        faultAccepted={dispute.faultAccepted}
        compact
      />

      <div className="flex gap-2 mt-4 pt-3 border-t border-light-border">
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="btn-tactile focus-ring flex-1 rounded-lg border border-light-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-light-secondary"
          >
            View Details
          </button>
        )}
        {showActions &&
          isOpen &&
          !hasCounterEvidence &&
          !responseWindowExpired && (
            <>
              {onRespond && (
                <button
                  onClick={onRespond}
                  className="btn-tactile focus-ring flex-1 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-medium text-white hover:shadow-md"
                >
                  Respond
                </button>
              )}
              {onAcceptFault && (
                <button
                  onClick={onAcceptFault}
                  className="btn-tactile focus-ring rounded-lg border border-error/30 px-4 py-2 text-sm font-medium text-error hover:bg-error/10"
                >
                  Accept Fault
                </button>
              )}
            </>
          )}
      </div>
    </div>
  );
}
