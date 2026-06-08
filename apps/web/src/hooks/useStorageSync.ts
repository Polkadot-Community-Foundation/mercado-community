import {
  useState,
  useEffect,
  useRef,
  type Dispatch,
  type SetStateAction,
} from 'react';

import { loadFromStorageAsync, saveToStorageAsync } from '../lib/hostStorage';

export interface StorageSyncOptions<T> {
  /** Storage key for persistence */
  storageKey: string;
  /** Default data when nothing is persisted */
  defaultData: T;
  /** Transform persisted data before setting state (e.g., merge with defaults) */
  transform?: (persisted: Partial<T>) => T;
  /** Whether to enable persistence (default: true) */
  enabled?: boolean;
}

export interface StorageSyncResult<T> {
  data: T;
  setData: Dispatch<SetStateAction<T>>;
  /** Whether data has been loaded from storage */
  isHydrated: boolean;
}

/**
 * Hook that syncs state with async storage.
 *
 * Handles:
 * - Loading data from storage on mount
 * - Persisting data changes with queuing to avoid dropped writes
 * - Graceful error handling for storage failures
 *
 * @example
 * ```ts
 * const { data, setData, isHydrated } = useStorageSync({
 *   storageKey: 'mercado:data',
 *   defaultData: DEFAULT_MOCK_DATA,
 *   transform: (persisted) => ({
 *     ...DEFAULT_MOCK_DATA,
 *     orders: persisted.orders ?? DEFAULT_MOCK_DATA.orders,
 *   }),
 * });
 * ```
 */
export function useStorageSync<T>({
  storageKey,
  defaultData,
  transform,
  enabled = true,
}: StorageSyncOptions<T>): StorageSyncResult<T> {
  const [data, setData] = useState<T>(defaultData);
  const [isHydrated, setIsHydrated] = useState(!enabled);
  const isSavingRef = useRef(false);
  const pendingDataRef = useRef<T | null>(null);

  // Load persisted data async on mount
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function hydrate() {
      const persisted = await loadFromStorageAsync<Partial<T>>(storageKey, {});

      if (cancelled) return;

      if (transform) {
        setData(transform(persisted));
      } else {
        setData({ ...defaultData, ...persisted });
      }
      setIsHydrated(true);
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [enabled, storageKey, defaultData, transform]);

  // Persist data changes async with queuing to avoid dropped writes
  useEffect(() => {
    if (!enabled || !isHydrated) return;

    // If currently saving, queue this data for next save
    if (isSavingRef.current) {
      pendingDataRef.current = data;
      return;
    }

    async function persistData(dataToSave: T) {
      isSavingRef.current = true;
      try {
        await saveToStorageAsync(storageKey, dataToSave);
      } catch (err) {
        console.error(`[useStorageSync] Failed to persist data:`, err);
      } finally {
        isSavingRef.current = false;
        // Check if there's pending data to save
        const pending = pendingDataRef.current;
        if (pending) {
          pendingDataRef.current = null;
          void persistData(pending).catch((err) => {
            console.error(
              `[useStorageSync] Failed to persist queued data:`,
              err,
            );
          });
        }
      }
    }

    void persistData(data).catch((err) => {
      console.error(`[useStorageSync] Failed to persist data:`, err);
    });
  }, [data, enabled, isHydrated, storageKey]);

  return { data, setData, isHydrated };
}
