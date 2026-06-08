import { DisputeStatus } from '@mercado/types';

import { DisputeDetailCard } from '../components/dispute';
import { useDispute, useRestaurant, useAccountInfo } from '../hooks';

type DisputeDetailContainerProps = {
  disputeId: string;
  onRespond?: () => void;
};

export function DisputeDetailContainer({
  disputeId,
  onRespond,
}: DisputeDetailContainerProps) {
  const { dispute, initiatorEvidence, counterEvidence } = useDispute(disputeId);
  const { restaurant } = useRestaurant(dispute?.restaurantId ?? '');
  const { account, restaurantId } = useAccountInfo();

  if (!dispute) {
    return (
      <div className="rounded-lg border border-light-border bg-light-secondary p-6 text-center text-text-secondary">
        Dispute not found
      </div>
    );
  }

  const isRestaurantOwner = restaurantId === dispute.restaurantId;
  const isCustomer = account?.address === dispute.customerId;
  const canRespond =
    isRestaurantOwner &&
    dispute.status === DisputeStatus.OPEN &&
    !dispute.counterEvidenceCID &&
    !dispute.faultAccepted;

  return (
    <DisputeDetailCard
      dispute={dispute}
      restaurant={restaurant}
      initiatorEvidence={initiatorEvidence}
      counterEvidence={counterEvidence}
      isRestaurantOwner={isRestaurantOwner}
      isCustomer={isCustomer}
      canRespond={canRespond}
      onRespond={onRespond}
    />
  );
}
