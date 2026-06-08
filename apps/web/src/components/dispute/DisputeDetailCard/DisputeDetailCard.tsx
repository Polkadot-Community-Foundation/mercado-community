import type { Dispute, DisputeEvidence, Restaurant } from '@mercado/types';
import { DisputeStatus } from '@mercado/types';

import { DisputeStatusBadge } from '../DisputeStatusBadge';
import { StakeDisplay } from '../StakeDisplay';
import { EvidenceDisplay } from '../EvidenceDisplay';

type DisputeDetailCardProps = {
  dispute: Dispute;
  restaurant?: Restaurant;
  initiatorEvidence?: DisputeEvidence;
  counterEvidence?: DisputeEvidence;
  isRestaurantOwner: boolean;
  isCustomer: boolean;
  canRespond: boolean;
  onRespond?: () => void;
};

export function DisputeDetailCard({
  dispute,
  restaurant,
  initiatorEvidence,
  counterEvidence,
  isRestaurantOwner,
  isCustomer,
  canRespond,
  onRespond,
}: DisputeDetailCardProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">
            Dispute #{dispute.id.slice(0, 8)}
          </h2>
          <p className="text-sm text-text-secondary">
            Restaurant: {restaurant?.name ?? 'Unknown'}
          </p>
        </div>
        <DisputeStatusBadge status={dispute.status} verdict={dispute.verdict} />
      </div>

      <StakeDisplay
        initiatorStake={dispute.initiatorStake}
        challengerStake={dispute.challengerStake}
        faultAccepted={dispute.faultAccepted}
      />

      <div className="space-y-4">
        <h3 className="font-medium text-text-primary">
          {isCustomer ? 'Your Evidence' : "Customer's Claim"}
        </h3>
        {initiatorEvidence ? (
          <EvidenceDisplay evidence={initiatorEvidence} />
        ) : (
          <div className="rounded-lg border border-light-border bg-light-secondary p-4 text-text-secondary">
            Evidence data unavailable
          </div>
        )}
      </div>

      {counterEvidence && (
        <div className="space-y-4">
          <h3 className="font-medium text-text-primary">
            {isRestaurantOwner ? 'Your Response' : "Restaurant's Response"}
          </h3>
          <EvidenceDisplay evidence={counterEvidence} />
        </div>
      )}

      {canRespond && onRespond && (
        <button
          onClick={onRespond}
          className="btn-tactile focus-ring w-full rounded-lg bg-gradient-brand py-3 font-medium text-white hover:shadow-md"
        >
          Respond to Dispute
        </button>
      )}

      {dispute.status === DisputeStatus.OPEN &&
        !canRespond &&
        !counterEvidence && (
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
            {isCustomer
              ? 'Waiting for the restaurant to respond...'
              : 'This dispute is awaiting response.'}
          </div>
        )}

      {dispute.status === DisputeStatus.OPEN && counterEvidence && (
        <div className="rounded-lg border border-info/30 bg-info/10 p-4 text-sm text-info">
          Both parties have submitted evidence. Awaiting admin resolution.
        </div>
      )}
    </div>
  );
}
