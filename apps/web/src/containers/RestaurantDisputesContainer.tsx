import { useState } from 'react';
import { DisputeStatus } from '@mercado/types';

import { DisputeCard } from '../components/dispute';
import { useRestaurantDisputes } from '../hooks';

import { CounterEvidenceContainer } from './CounterEvidenceContainer';
import { DisputeDetailContainer } from './DisputeDetailContainer';

export function RestaurantDisputesContainer() {
  const { disputes } = useRestaurantDisputes();
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(
    null,
  );
  const [isResponding, setIsResponding] = useState(false);

  if (disputes.length === 0) {
    return (
      <div className="rounded-lg border border-light-border bg-light-secondary p-6 text-center text-text-secondary">
        No disputes have been raised against your restaurant.
      </div>
    );
  }

  // If a dispute is selected, show the detail view
  if (selectedDisputeId) {
    const selectedDispute = disputes.find(
      (d) => d.dispute.id === selectedDisputeId,
    );

    if (isResponding && selectedDispute) {
      return (
        <div className="space-y-4">
          <button
            onClick={() => {
              setIsResponding(false);
            }}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
          >
            &larr; Back to dispute
          </button>
          <h2 className="text-lg font-bold text-text-primary">
            Respond to Dispute
          </h2>
          <CounterEvidenceContainer
            disputeId={selectedDisputeId}
            onComplete={() => {
              setIsResponding(false);
            }}
            onCancel={() => {
              setIsResponding(false);
            }}
          />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedDisputeId(null)}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
        >
          &larr; Back to disputes
        </button>
        <DisputeDetailContainer
          disputeId={selectedDisputeId}
          onRespond={() => setIsResponding(true)}
        />
      </div>
    );
  }

  // Show the list of disputes
  const openDisputes = disputes.filter(
    (d) => d.dispute.status === DisputeStatus.OPEN,
  );
  const resolvedDisputes = disputes.filter(
    (d) => d.dispute.status === DisputeStatus.RESOLVED,
  );

  return (
    <div className="space-y-6">
      {openDisputes.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-text-primary">
            Open Disputes ({openDisputes.length})
          </h3>
          {openDisputes.map(({ dispute, responseWindowExpired }) => (
            <DisputeCard
              key={dispute.id}
              dispute={dispute}
              onViewDetails={() => setSelectedDisputeId(dispute.id)}
              showActions
              responseWindowExpired={responseWindowExpired}
              onRespond={
                !dispute.counterEvidenceCID &&
                !dispute.faultAccepted &&
                !responseWindowExpired
                  ? () => {
                      setSelectedDisputeId(dispute.id);
                      setIsResponding(true);
                    }
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {resolvedDisputes.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-text-primary">
            Resolved Disputes ({resolvedDisputes.length})
          </h3>
          {resolvedDisputes.map(({ dispute }) => (
            <DisputeCard
              key={dispute.id}
              dispute={dispute}
              onViewDetails={() => setSelectedDisputeId(dispute.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
