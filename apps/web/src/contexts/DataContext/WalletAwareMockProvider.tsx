/**
 * Mock data provider with real wallet connection.
 *
 * This provider uses mock hooks for all data operations (orders, restaurants, etc.)
 * but connects to a real Polkadot wallet for account authentication.
 *
 * Use this for production-like testing where you want real wallet auth
 * but don't have a live backend.
 */
import { useEffect, useMemo, useCallback, type ReactNode } from 'react';

import {
  MockStoreContext,
  useMockStore,
  type MockDataTree,
} from '../../stores';
import { useRealAccountInfo } from '../../hooks/useAccountInfo/useAccountInfo';
import { useStorageSync } from '../../hooks/useStorageSync';

import { mockHooks } from './hookRegistries';
import { DEFAULT_MOCK_DATA } from './mockData';
import { DataProvider, type UseAccountInfoResult } from './DataContext';

const STORAGE_KEY = 'mercado:data';

/**
 * Wraps useRealAccountInfo and syncs the resolved account into MockStore.
 * Also derives restaurantId from the live store (not static mocks).
 */
function useSyncedAccountInfo(): UseAccountInfoResult {
  const result = useRealAccountInfo();
  const { data, setData } = useMockStore();

  useEffect(() => {
    setData((prev) => {
      if (prev.activeAccount === result.account) return prev;
      return { ...prev, activeAccount: result.account };
    });
  }, [result.account, setData]);

  // Derive restaurantId from live context data (not static mocks)
  const restaurantId = useMemo(() => {
    if (!result.account) return null;
    const restaurant = data.restaurants.find(
      (r) => r.owner === result.account?.address,
    );
    return restaurant?.id ?? null;
  }, [result.account, data.restaurants]);

  return useMemo(
    () => ({
      account: result.account,
      restaurantId,
      signer: result.signer,
      isLoading: result.isLoading,
    }),
    [result.account, restaurantId, result.signer, result.isLoading],
  );
}

/**
 * Inner component that has access to MockStore context.
 */
function WalletAwareMockProviderInner({ children }: { children: ReactNode }) {
  const hooks = useMemo(
    () => ({
      ...mockHooks,
      useAccountInfo: useSyncedAccountInfo,
    }),
    [],
  );

  return <DataProvider value={hooks}>{children}</DataProvider>;
}

export function WalletAwareMockProvider({ children }: { children: ReactNode }) {
  // Create a stable transform function that merges persisted data with defaults
  const transform = useCallback(
    (persisted: Partial<MockDataTree>): MockDataTree => ({
      ...DEFAULT_MOCK_DATA,
      orders: persisted.orders ?? DEFAULT_MOCK_DATA.orders,
      disputes: persisted.disputes ?? DEFAULT_MOCK_DATA.disputes,
      evidenceStore: persisted.evidenceStore ?? DEFAULT_MOCK_DATA.evidenceStore,
      activeAccount: persisted.activeAccount ?? DEFAULT_MOCK_DATA.activeAccount,
    }),
    [],
  );

  const { data, setData } = useStorageSync({
    storageKey: STORAGE_KEY,
    defaultData: DEFAULT_MOCK_DATA,
    transform,
    enabled: true,
  });

  const storeValue = useMemo(() => ({ data, setData }), [data, setData]);

  return (
    <MockStoreContext.Provider value={storeValue}>
      <WalletAwareMockProviderInner>{children}</WalletAwareMockProviderInner>
    </MockStoreContext.Provider>
  );
}
