import { useState } from 'react';
import {
  Settings,
  Wallet,
  TrendingUp,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import type { MatchMaker } from '@mercado/types';

type DashboardProps = {
  matchmaker: MatchMaker;
  onUpdateFee: (newFeePercent: number) => Promise<void>;
  onClaimFees: () => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
};

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatFees(fees: bigint): string {
  // Assuming 10 decimals like PAS token
  const value = Number(fees) / 1e10;
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

export function Dashboard({
  matchmaker,
  onUpdateFee,
  onClaimFees,
  isLoading,
  error,
}: DashboardProps) {
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [newFee, setNewFee] = useState(matchmaker.feePercentage / 100);

  const handleUpdateFee = async () => {
    await onUpdateFee(newFee);
    setShowFeeModal(false);
  };

  const canClaimFees = matchmaker.feesAccumulated > 0n;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Matchmaker Portal</h1>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            matchmaker.active
              ? 'bg-success/10 text-success'
              : 'bg-gray-100 text-text-secondary'
          }`}
        >
          {matchmaker.active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-error text-sm bg-error/10 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-brand/10 rounded-lg">
              <Settings className="w-5 h-5 text-brand" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Matchmaker ID</p>
              <p className="font-mono font-medium">#{matchmaker.id}</p>
            </div>
          </div>
          <p className="text-lg font-semibold">{matchmaker.name}</p>
          <p className="text-sm text-text-secondary font-mono truncate">
            {matchmaker.owner}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-brand/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-brand" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Current Fee</p>
              <p className="text-2xl font-bold">
                {matchmaker.feePercentage / 100}%
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowFeeModal(true)}
            className="btn-secondary w-full text-sm"
            disabled={isLoading}
          >
            Update Fee
          </button>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-brand/10 rounded-lg">
              <Wallet className="w-5 h-5 text-brand" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Accumulated Fees</p>
              <p className="text-2xl font-bold">
                {formatFees(matchmaker.feesAccumulated)} PAS
              </p>
            </div>
          </div>
          <button
            onClick={onClaimFees}
            className="btn-primary w-full text-sm"
            disabled={isLoading || !canClaimFees}
          >
            {canClaimFees ? 'Claim Fees' : 'No Fees to Claim'}
          </button>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-brand/10 rounded-lg">
              <Calendar className="w-5 h-5 text-brand" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Registered</p>
              <p className="font-medium">
                {formatDate(matchmaker.registeredAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Dialog.Root open={showFeeModal} onOpenChange={setShowFeeModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 w-full max-w-md">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Update Fee Percentage
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  New Fee: {newFee}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={newFee}
                  onChange={(e) => setNewFee(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-text-secondary mt-1">
                  <span>0%</span>
                  <span>10% (max)</span>
                </div>
              </div>

              <p className="text-sm text-text-secondary">
                This change will only affect future orders. Existing orders keep
                their original fee.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowFeeModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateFee}
                  className="btn-primary flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
