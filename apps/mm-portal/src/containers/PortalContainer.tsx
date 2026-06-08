import { useState } from 'react';

import { useMatchMakerState } from '../app';
import { Dashboard } from '../components/Dashboard/Dashboard';

export function PortalContainer() {
  const { matchMaker, updateFee, claimFees, isLoading } = useMatchMakerState();
  const [error, setError] = useState<string | null>(null);

  if (!matchMaker) {
    return null;
  }

  const handleUpdateFee = async (newFeePercent: number) => {
    setError(null);
    try {
      await updateFee(newFeePercent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update fee');
    }
  };

  const handleClaimFees = async () => {
    setError(null);
    try {
      await claimFees();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim fees');
    }
  };

  return (
    <Dashboard
      matchmaker={matchMaker}
      onUpdateFee={handleUpdateFee}
      onClaimFees={handleClaimFees}
      isLoading={isLoading}
      error={error}
    />
  );
}
