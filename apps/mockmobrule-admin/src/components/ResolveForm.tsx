import { useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Verdict } from '@mercado/types';

import { useResolveDispute } from '../hooks/useResolveDispute';

type ResolveFormProps = {
  disputeId: string;
  onResolved?: () => void;
};

export function ResolveForm({ disputeId, onResolved }: ResolveFormProps) {
  const { resolveDispute, isResolving, error } = useResolveDispute();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedVerdict, setSelectedVerdict] = useState<Verdict | null>(null);

  const handleSelect = (verdict: Verdict) => {
    setSelectedVerdict(verdict);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!selectedVerdict) return;
    try {
      await resolveDispute(disputeId, selectedVerdict);
      setShowConfirm(false);
      setSelectedVerdict(null);
      onResolved?.();
    } catch {
      // Error is already set by the hook
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setSelectedVerdict(null);
  };

  if (showConfirm) {
    const isAccept = selectedVerdict === Verdict.CustomerWins;
    return (
      <div className="space-y-3">
        <p className="text-sm text-text-secondary">
          {isAccept
            ? 'This will rule in favor of the customer. The restaurant will lose their stake.'
            : 'This will rule in favor of the restaurant. The customer will lose their stake.'}
        </p>

        {error && (
          <div className="rounded-lg bg-error/10 p-3 text-sm text-error">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            disabled={isResolving}
            className={`btn-tactile focus-ring flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
              isAccept
                ? 'bg-success hover:bg-success/90'
                : 'bg-error hover:bg-error/90'
            }`}
          >
            {isResolving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Resolving...
              </>
            ) : (
              'Confirm'
            )}
          </button>
          <button
            onClick={handleCancel}
            disabled={isResolving}
            className="btn-tactile focus-ring flex-1 rounded-lg border border-light-border bg-white px-4 py-2 text-sm font-medium text-text-primary hover:bg-light-secondary disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleSelect(Verdict.CustomerWins)}
        className="btn-tactile focus-ring flex flex-1 items-center justify-center gap-2 rounded-lg bg-success px-4 py-2 text-sm font-medium text-white hover:bg-success/90"
      >
        <CheckCircle className="h-4 w-4" />
        Accept Dispute
      </button>
      <button
        onClick={() => handleSelect(Verdict.RestaurantWins)}
        className="btn-tactile focus-ring flex flex-1 items-center justify-center gap-2 rounded-lg bg-error px-4 py-2 text-sm font-medium text-white hover:bg-error/90"
      >
        <XCircle className="h-4 w-4" />
        Reject Dispute
      </button>
    </div>
  );
}
