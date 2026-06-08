import { useCallback } from 'react';
import type { MatchMakerRegistrationInput } from '@mercado/types';

import type { UseMatchMakerActionsResult } from '../../contexts/DataContext/DataContext';
import { percentToBps } from '../../lib/pricing';
import { useMockStore } from '../../stores';

export function useMockMatchMakerActions(): UseMatchMakerActionsResult {
  const { data, setData } = useMockStore();

  const registerMatchMaker = useCallback(
    async (input: MatchMakerRegistrationInput): Promise<string> => {
      if (!data.activeAccount) {
        throw new Error('Must be logged in to register');
      }

      const address = data.activeAccount.address;
      if (data.matchMakerIdByOwner[address]) {
        throw new Error('Already registered as matchmaker');
      }

      if (!input.name.trim()) {
        throw new Error('Name is required');
      }

      if (input.feePercentage < 0) {
        throw new Error('Fee cannot be negative');
      }
      const feeBps = percentToBps(input.feePercentage);
      if (feeBps > 1000) {
        throw new Error('Fee cannot exceed 10%');
      }

      const id = String(data.matchMakers.length + 1);

      setData((prev) => ({
        ...prev,
        matchMakers: [
          ...prev.matchMakers,
          {
            id,
            owner: address,
            name: input.name.trim(),
            feePercentage: feeBps,
            registeredAt: Date.now(),
            active: true,
            feesAccumulated: 0n,
          },
        ],
        matchMakerIdByOwner: {
          ...prev.matchMakerIdByOwner,
          [address]: id,
        },
      }));

      return id;
    },
    [
      data.activeAccount,
      data.matchMakerIdByOwner,
      data.matchMakers.length,
      setData,
    ],
  );

  const updateFee = useCallback(
    async (newFeePercent: number): Promise<void> => {
      if (!data.activeAccount) {
        throw new Error('Must be logged in');
      }

      const address = data.activeAccount.address;
      const mmId = data.matchMakerIdByOwner[address];
      if (!mmId) {
        throw new Error('Not registered as matchmaker');
      }

      if (newFeePercent < 0) {
        throw new Error('Fee cannot be negative');
      }
      const feeBps = percentToBps(newFeePercent);
      if (feeBps > 1000) {
        throw new Error('Fee cannot exceed 10%');
      }

      setData((prev) => ({
        ...prev,
        matchMakers: prev.matchMakers.map((m) =>
          m.id === mmId ? { ...m, feePercentage: feeBps } : m,
        ),
      }));
    },
    [data.activeAccount, data.matchMakerIdByOwner, setData],
  );

  const claimFees = useCallback(
    // toAddress is used in real implementation for transfer destination
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (toAddress: string): Promise<void> => {
      if (!data.activeAccount) {
        throw new Error('Must be logged in');
      }

      const address = data.activeAccount.address;
      const mmId = data.matchMakerIdByOwner[address];
      if (!mmId) {
        throw new Error('Not registered as matchmaker');
      }

      const mm = data.matchMakers.find((m) => m.id === mmId);
      if (!mm || mm.feesAccumulated === 0n) {
        throw new Error('No fees to claim');
      }

      setData((prev) => ({
        ...prev,
        matchMakers: prev.matchMakers.map((m) =>
          m.id === mmId ? { ...m, feesAccumulated: 0n } : m,
        ),
      }));
    },
    [data.activeAccount, data.matchMakerIdByOwner, data.matchMakers, setData],
  );

  return {
    registerMatchMaker,
    updateFee,
    claimFees,
    isLoading: false,
    error: null,
  };
}
