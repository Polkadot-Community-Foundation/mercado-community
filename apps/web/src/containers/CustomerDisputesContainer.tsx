import { useNavigate } from 'react-router';

import { DisputeCard } from '../components/dispute';
import { useCustomerDisputes } from '../hooks';

export function CustomerDisputesContainer() {
  const navigate = useNavigate();
  const { disputes } = useCustomerDisputes();

  if (disputes.length === 0) {
    return (
      <div className="rounded-lg border border-light-border bg-light-secondary p-6 text-center text-text-secondary">
        You haven't raised any disputes yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {disputes.map(({ dispute, restaurantName }) => (
        <DisputeCard
          key={dispute.id}
          dispute={dispute}
          restaurantName={restaurantName}
          onViewDetails={() => navigate(`/disputes/${dispute.id}`)}
        />
      ))}
    </div>
  );
}
