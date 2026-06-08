import { useMemo } from 'react';
import { useAuth } from '@mercado/core-hooks';

import type { UseAccountInfoResult } from '../../contexts/DataContext/DataContext';

/**
 * Real account info hook that integrates with the Host API via AuthContext.
 *
 * Provides:
 * - account: The connected account (name, address)
 * - signer: PolkadotSigner for transaction signing
 * - restaurantId: Always null here - derived by data providers from live store
 * - isLoading: Whether account info is still being fetched
 *
 * Note: restaurantId is intentionally not derived here to avoid depending on
 * static mocks. The data providers (RealDataProvider, WalletAwareMockProvider)
 * use useSyncedAccountInfo which derives restaurantId from the live data store.
 */
export function useRealAccountInfo(): UseAccountInfoResult {
  const { account, signer, isLoading } = useAuth();

  return useMemo(
    () => ({ account, restaurantId: null, signer, isLoading }),
    [account, signer, isLoading],
  );
}
