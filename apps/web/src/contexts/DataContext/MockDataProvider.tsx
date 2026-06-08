/**
 * Mock data provider for fully mocked development/testing.
 * Uses mock hooks for all operations including account.
 */
import { useMemo, useCallback, type ReactNode } from 'react';

import { MockStoreContext, type MockDataTree } from '../../stores';
import { useStorageSync } from '../../hooks/useStorageSync';

import { mockHooks } from './hookRegistries';
import { DEFAULT_MOCK_DATA } from './mockData';
import { DataProvider, type DataContextValue } from './DataContext';

const STORAGE_KEY = 'mercado:data';

type MockDataProviderProps = {
  initialData?: Partial<MockDataTree>;
  enablePersistence?: boolean;
  hookOverrides?: Partial<DataContextValue>;
  children: ReactNode;
};

export function MockDataProvider({
  initialData,
  enablePersistence = true,
  hookOverrides,
  children,
}: MockDataProviderProps) {
  // Memoize defaultData to prevent infinite re-renders in useStorageSync
  const defaultData = useMemo(
    () => ({ ...DEFAULT_MOCK_DATA, ...initialData }),
    [initialData],
  );

  // Create a stable transform function that merges persisted data with defaults
  const transform = useCallback(
    (persisted: Partial<MockDataTree>): MockDataTree => ({
      ...DEFAULT_MOCK_DATA,
      orders: persisted.orders ?? DEFAULT_MOCK_DATA.orders,
      disputes: persisted.disputes ?? DEFAULT_MOCK_DATA.disputes,
      evidenceStore: persisted.evidenceStore ?? DEFAULT_MOCK_DATA.evidenceStore,
      activeAccount: persisted.activeAccount ?? DEFAULT_MOCK_DATA.activeAccount,
      ...initialData,
    }),
    [initialData],
  );

  const { data, setData } = useStorageSync({
    storageKey: STORAGE_KEY,
    defaultData,
    transform,
    enabled: enablePersistence,
  });

  const storeValue = useMemo(() => ({ data, setData }), [data, setData]);

  const hooks = useMemo(
    () => ({ ...mockHooks, ...hookOverrides }),
    [hookOverrides],
  );

  return (
    <MockStoreContext.Provider value={storeValue}>
      <DataProvider value={hooks}>{children}</DataProvider>
    </MockStoreContext.Provider>
  );
}
