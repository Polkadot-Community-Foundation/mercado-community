import { useState } from 'react';

import {
  CounterEvidenceForm,
  type CounterEvidenceFormData,
} from '../components/dispute';
import { useAddCounterEvidence, useAcceptFault } from '../hooks';

type CounterEvidenceContainerProps = {
  disputeId: string;
  onComplete: () => void;
  onCancel: () => void;
};

export function CounterEvidenceContainer({
  disputeId,
  onComplete,
  onCancel,
}: CounterEvidenceContainerProps) {
  const { addCounterEvidence, stakeAmount } = useAddCounterEvidence();
  const { acceptFault } = useAcceptFault();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CounterEvidenceFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await addCounterEvidence({
        disputeId,
        title: data.title,
        description: data.description,
        photos: data.photos,
      });

      onComplete();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to submit counter-evidence',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptFault = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await acceptFault(disputeId);
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept fault');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CounterEvidenceForm
      stakeAmount={stakeAmount}
      isLoading={isLoading}
      error={error}
      onSubmit={handleSubmit}
      onAcceptFault={handleAcceptFault}
      onCancel={onCancel}
    />
  );
}
