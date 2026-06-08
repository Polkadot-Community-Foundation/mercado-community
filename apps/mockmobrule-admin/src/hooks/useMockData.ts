import { useState, useEffect, useCallback } from 'react';
import type { Dispute, DisputeEvidence } from '@mercado/types';

type MockDataTree = {
  disputes: Dispute[];
  evidenceStore: Record<string, DisputeEvidence>;
  orders: unknown[];
};

const STORAGE_KEY = 'mercado:data';

function loadFromStorage(): MockDataTree | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    // Convert bigint strings back to bigint
    if (parsed.disputes) {
      parsed.disputes = parsed.disputes.map((d: Dispute) => ({
        ...d,
        initiatorStake:
          typeof d.initiatorStake === 'string'
            ? BigInt(d.initiatorStake)
            : d.initiatorStake,
        challengerStake:
          typeof d.challengerStake === 'string'
            ? BigInt(d.challengerStake)
            : d.challengerStake,
      }));
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveToStorage(data: MockDataTree) {
  try {
    // Convert bigint to string for JSON serialization
    const serializable = {
      ...data,
      disputes: data.disputes.map((d) => ({
        ...d,
        initiatorStake: d.initiatorStake.toString(),
        challengerStake: d.challengerStake.toString(),
      })),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    // Ignore storage errors
  }
}

export function useMockData() {
  const [data, setData] = useState<MockDataTree | null>(() =>
    loadFromStorage(),
  );

  // Listen for storage changes from other tabs (e.g., the web app)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setData(loadFromStorage());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Poll for changes in the same tab (localStorage doesn't fire events for same-tab changes)
  useEffect(() => {
    const interval = setInterval(() => {
      const fresh = loadFromStorage();
      if (JSON.stringify(fresh) !== JSON.stringify(data)) {
        setData(fresh);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [data]);

  const updateDispute = useCallback(
    (disputeId: string, updates: Partial<Dispute>) => {
      const current = loadFromStorage();
      if (!current) return;

      const updatedDisputes = current.disputes.map((d) =>
        d.id === disputeId ? { ...d, ...updates } : d,
      );

      const newData = { ...current, disputes: updatedDisputes };
      saveToStorage(newData);
      setData(newData);
    },
    [],
  );

  return {
    disputes: data?.disputes ?? [],
    evidenceStore: data?.evidenceStore ?? {},
    updateDispute,
    isLoaded: data !== null,
  };
}
