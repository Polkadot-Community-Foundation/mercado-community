import { useState } from 'react';
import { useNavigate } from 'react-router';

import {
  RaiseDisputeForm,
  type RaiseDisputeFormData,
} from '../components/dispute';
import { useRaiseDispute } from '../hooks';

type SubmitProgress = 'idle' | 'uploading' | 'creating' | 'success';

type RaiseDisputeContainerProps = {
  orderId: string;
  initiator?: 'customer' | 'restaurant';
  onCancel: () => void;
};

export function RaiseDisputeContainer({
  orderId,
  initiator = 'customer',
  onCancel,
}: RaiseDisputeContainerProps) {
  const navigate = useNavigate();
  const { raiseDispute, stakeAmount } = useRaiseDispute();
  const [progress, setProgress] = useState<SubmitProgress>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: RaiseDisputeFormData) => {
    setError(null);

    try {
      setProgress(data.photos.length > 0 ? 'uploading' : 'creating');

      // Small delay to show upload progress if photos exist
      if (data.photos.length > 0) {
        await new Promise((r) => setTimeout(r, 300));
        setProgress('creating');
      }

      const disputeId = await raiseDispute({
        orderId,
        reason: data.reason,
        title: data.title,
        description: data.description,
        photos: data.photos,
        initiator,
      });

      setProgress('success');
      await new Promise((r) => setTimeout(r, 500));
      navigate(`/disputes/${disputeId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to raise dispute');
      setProgress('idle');
    }
  };

  const progressMessage: Record<SubmitProgress, string> = {
    idle: '',
    uploading: 'Uploading photos...',
    creating: 'Creating dispute...',
    success: 'Success!',
  };

  return (
    <RaiseDisputeForm
      stakeAmount={stakeAmount}
      initiator={initiator}
      isLoading={progress !== 'idle'}
      loadingMessage={progressMessage[progress]}
      error={error}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
}
