/**
 * Real data provider with contract interactions.
 *
 * This provider uses:
 * - Real hooks for contract operations (disputes, ratings, bulletin)
 * - Mock hooks for data that isn't on-chain yet (restaurants, orders, locations)
 * - Real wallet connection via AuthContext
 *
 * Use this when you want to interact with deployed contracts while
 * still using mock data for restaurants/orders (which aren't on-chain yet).
 */
import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';

import {
  MockStoreContext,
  useMockStore,
  type MockDataTree,
} from '../../stores';
import { useRealAccountInfo } from '../../hooks/useAccountInfo/useAccountInfo';
import {
  loadFromStorageAsync,
  saveToStorageAsync,
} from '../../lib/hostStorage';
import { useContracts } from '../ContractsContext';
import { toEvmAddress } from '../../lib/contracts';

import { mockHooks, realHooks } from './hookRegistries';
import { DEFAULT_MOCK_DATA } from './mockData';
import { DataProvider, type UseAccountInfoResult } from './DataContext';

const STORAGE_KEY = 'mercado:data';

/**
 * Wraps useRealAccountInfo and syncs the resolved account into MockStore.
 * Queries the contract for restaurantId instead of using mock data.
 */
function useSyncedAccountInfo(): UseAccountInfoResult {
  const result = useRealAccountInfo();
  const { setData } = useMockStore();
  const { core, isConnected } = useContracts();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    setData((prev) => {
      if (prev.activeAccount === result.account) return prev;
      return { ...prev, activeAccount: result.account };
    });
  }, [result.account, setData]);

  // Query contract for restaurant ID owned by this account
  const fetchRestaurantId = useCallback(async () => {
    if (!core || !isConnected || !result.account) {
      console.log('[RealDataProvider] Cannot fetch restaurant ID:', {
        hasCore: !!core,
        isConnected,
        hasAccount: !!result.account,
      });
      setRestaurantId(null);
      return;
    }

    try {
      // Convert SS58 address to EVM H160 format for contract call
      const evmAddress = toEvmAddress(result.account.address);
      console.log(
        '[RealDataProvider] Fetching restaurant ID for:',
        result.account.address,
        '-> EVM:',
        evmAddress,
      );
      const id = await core.read<bigint>('ownerToRestaurant', [evmAddress]);
      console.log('[RealDataProvider] Contract returned restaurant ID:', id);
      // Contract returns 0 if no restaurant registered
      setRestaurantId(id && id > 0n ? id.toString() : null);
    } catch (err) {
      console.warn('Failed to fetch restaurant ID from contract:', err);
      setRestaurantId(null);
    }
  }, [core, isConnected, result.account]);

  useEffect(() => {
    fetchRestaurantId();
  }, [fetchRestaurantId]);

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
function RealDataProviderInner({ children }: { children: ReactNode }) {
  const hooks = useMemo(
    () => ({
      // Start with all mock hooks
      ...mockHooks,
      // Override with real hooks for contract interactions
      ...realHooks,
      // Use synced account info (real wallet + mock store sync)
      useAccountInfo: useSyncedAccountInfo,
    }),
    [],
  );

  return <DataProvider value={hooks}>{children}</DataProvider>;
}

export function RealDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<MockDataTree>(DEFAULT_MOCK_DATA);
  const [isHydrated, setIsHydrated] = useState(false);
  const isSavingRef = useRef(false);
  const pendingDataRef = useRef<MockDataTree | null>(null);

  // Load persisted data async on mount
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const persisted = await loadFromStorageAsync<Partial<MockDataTree>>(
        STORAGE_KEY,
        {},
      );

      if (cancelled) return;

      // Always use fresh restaurant/location data from mocks
      // Only persist user-created data (orders, disputes, account)
      setData({
        ...DEFAULT_MOCK_DATA,
        orders: persisted.orders ?? DEFAULT_MOCK_DATA.orders,
        disputes: persisted.disputes ?? DEFAULT_MOCK_DATA.disputes,
        evidenceStore:
          persisted.evidenceStore ?? DEFAULT_MOCK_DATA.evidenceStore,
        activeAccount:
          persisted.activeAccount ?? DEFAULT_MOCK_DATA.activeAccount,
      });
      setIsHydrated(true);
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist data changes async with queuing to avoid dropped writes
  useEffect(() => {
    if (!isHydrated) return;

    // If currently saving, queue this data for next save
    if (isSavingRef.current) {
      pendingDataRef.current = data;
      return;
    }

    async function persistData(dataToSave: MockDataTree) {
      isSavingRef.current = true;
      try {
        await saveToStorageAsync(STORAGE_KEY, dataToSave);
      } catch (err) {
        console.error('[RealDataProvider] Failed to persist data:', err);
      } finally {
        isSavingRef.current = false;
        // Check if there's pending data to save
        const pending = pendingDataRef.current;
        if (pending) {
          pendingDataRef.current = null;
          void persistData(pending).catch((err) => {
            console.error(
              '[RealDataProvider] Failed to persist queued data:',
              err,
            );
          });
        }
      }
    }

    void persistData(data).catch((err) => {
      console.error('[RealDataProvider] Failed to persist data:', err);
    });
  }, [data, isHydrated]);

  const storeValue = useMemo(() => ({ data, setData }), [data]);

  return (
    <MockStoreContext.Provider value={storeValue}>
      <RealDataProviderInner>{children}</RealDataProviderInner>
    </MockStoreContext.Provider>
  );
}
