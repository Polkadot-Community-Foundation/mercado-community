/**
 * Authentication context for Host API integration.
 *
 * Manages authentication state and provides:
 * - Account info (name, address)
 * - Polkadot signer for transaction signing
 * - Connection status subscription for login/logout detection
 *
 * When running in a container (Polkadot Triangle), this context
 * subscribes to account connection status changes and automatically
 * updates when the user logs in or out of their host wallet.
 *
 * Follows mark3t's AuthProvider pattern for:
 * - Timeout protection around host auth handshake
 * - Canonical anonymous state for consistent resets
 * - Subscription lifecycle paired with provider instance
 * - Cancellation tracking to prevent stale state updates
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type { PolkadotSigner } from 'polkadot-api';
import type { AccountConnectionStatus } from '@novasamatech/host-api-wrapper';
import type { AccountInfo } from '@mercado/types';

import { isInsideContainer } from './container';
import { requestRemotePermissions } from './permissions';
import { withTimeout, isTimeout } from './internal/withTimeout';
import { debug } from './internal/debug';
import { requestHostAccount, type HostAccountSuccess } from './hostAccount';
import { useStaleRequestProtection } from './useStaleRequestProtection';

const AUTH_TIMEOUT_MS = 35_000;

export type AuthError =
  | 'not_in_container'
  | 'invalid_environment'
  | 'spektr_injection_failed'
  | 'no_product_account'
  | 'timeout'
  | 'unknown';

type AuthState = {
  isLoading: boolean;
  isAuthenticated: boolean;
  account: AccountInfo | null;
  signer: PolkadotSigner | null;
  connectionStatus: AccountConnectionStatus | null;
  authError: AuthError | null;
};

type AuthContextValue = AuthState & {
  refetch: () => Promise<void>;
};

export interface AuthProviderProps {
  children: ReactNode;
  /** DotNS identifier for the product account (default: 'mercado.dot') */
  dotNsIdentifier?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Canonical anonymous state - used for all resets to ensure consistency */
const ANON_STATE: AuthState = {
  isLoading: false,
  isAuthenticated: false,
  account: null,
  signer: null,
  connectionStatus: null,
  authError: null,
};

export function AuthProvider({ children, dotNsIdentifier }: AuthProviderProps) {
  const inContainer = isInsideContainer();
  const { startRequest, isStale } = useStaleRequestProtection();

  const [state, setState] = useState<AuthState>(() =>
    inContainer ? { ...ANON_STATE, isLoading: true } : ANON_STATE,
  );

  // Store unsubscribe and refetch functions - tied to current provider instance
  const unsubRef = useRef<(() => void) | null>(null);
  const refetchRef = useRef<HostAccountSuccess['refetch'] | null>(null);

  // Manual refetch exposed via context
  const refetch = useCallback(async () => {
    if (!refetchRef.current) return;

    const thisRequest = startRequest();
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const result = await withTimeout(refetchRef.current(), AUTH_TIMEOUT_MS);

      if (isStale(thisRequest)) {
        debug.log(' Stale refetch result, ignoring');
        return;
      }

      if (isTimeout(result)) {
        debug.warn(' Refetch timed out');
        refetchRef.current = null;
        setState({ ...ANON_STATE, authError: 'timeout' });
      } else if (result) {
        // Request permissions before publishing authenticated state
        await requestRemotePermissions();

        // Re-check staleness after async permission request
        if (isStale(thisRequest)) {
          debug.log(' Stale after permissions in refetch, ignoring');
          return;
        }

        setState({
          isLoading: false,
          isAuthenticated: true,
          account: result.account,
          signer: result.signer,
          connectionStatus: 'connected',
          authError: null,
        });
      } else {
        refetchRef.current = null;
        setState({ ...ANON_STATE, authError: 'no_product_account' });
      }
    } catch (err) {
      debug.error(' Refetch failed:', err);
      if (!isStale(thisRequest)) {
        refetchRef.current = null;
        setState({ ...ANON_STATE, authError: 'unknown' });
      }
    }
  }, [startRequest, isStale]);

  // Auto-detect Host container and authenticate on mount
  useEffect(() => {
    if (!inContainer) {
      setState({ ...ANON_STATE, authError: 'not_in_container' });
      return;
    }

    let cancelled = false;
    const thisRequest = startRequest();

    async function autoConnect() {
      const result = await withTimeout(
        requestHostAccount({ dotNsIdentifier }),
        AUTH_TIMEOUT_MS,
      );

      if (cancelled || isStale(thisRequest)) {
        debug.log(' Cancelled or stale, ignoring result');
        return;
      }

      if (isTimeout(result)) {
        debug.warn(' Auth timed out');
        setState({ ...ANON_STATE, authError: 'timeout' });
        return;
      }

      // Helper to set up subscription for connection status changes
      const setupSubscription = (
        subscribe: (
          cb: (status: AccountConnectionStatus) => void,
        ) => () => void,
        providerRefetch: () => Promise<{
          account: AccountInfo;
          signer: PolkadotSigner;
        } | null>,
      ) => {
        unsubRef.current = subscribe((status) => {
          const statusRequest = startRequest();

          setState((prev) => ({ ...prev, connectionStatus: status }));

          if (status === 'connected') {
            void (async () => {
              try {
                const refetchResult = await withTimeout(
                  providerRefetch(),
                  AUTH_TIMEOUT_MS,
                );

                if (isStale(statusRequest)) {
                  debug.log(' Stale reconnect result, ignoring');
                  return;
                }

                if (isTimeout(refetchResult)) {
                  debug.warn(' Reconnect timed out');
                  refetchRef.current = null;
                  setState({ ...ANON_STATE, authError: 'timeout' });
                } else if (refetchResult) {
                  // Request permissions before publishing authenticated state
                  await requestRemotePermissions();

                  // Re-check staleness after async permission request
                  if (isStale(statusRequest)) {
                    debug.log(
                      ' Stale after permissions in reconnect, ignoring',
                    );
                    return;
                  }

                  setState({
                    isLoading: false,
                    isAuthenticated: true,
                    account: refetchResult.account,
                    signer: refetchResult.signer,
                    connectionStatus: 'connected',
                    authError: null,
                  });
                } else {
                  refetchRef.current = null;
                  setState({ ...ANON_STATE, authError: 'no_product_account' });
                }
              } catch (err) {
                debug.error(' Reconnect refetch failed:', err);
                if (!isStale(statusRequest)) {
                  refetchRef.current = null;
                  setState({ ...ANON_STATE, authError: 'unknown' });
                }
              }
            })();
          } else if (status === 'disconnected') {
            refetchRef.current = null;
            setState(ANON_STATE);
          }
        });
      };

      if (!result.ok) {
        // Map specific error from requestHostAccount
        // But still subscribe if we have pending handlers (valid environment, just no account)
        if (result.pending) {
          refetchRef.current = result.pending.refetch;
          setupSubscription(result.pending.subscribe, result.pending.refetch);
        }
        setState({ ...ANON_STATE, authError: result.error });
        return;
      }

      const {
        account,
        signer,
        subscribe,
        refetch: providerRefetch,
      } = result.value;

      refetchRef.current = providerRefetch;

      // Set up subscription BEFORE awaiting permissions to avoid missing status changes
      setupSubscription(subscribe, providerRefetch);

      // Request permissions before publishing authenticated state
      await requestRemotePermissions();

      // Re-check staleness after async permission request
      if (cancelled || isStale(thisRequest)) {
        debug.log(' Stale after permissions in autoConnect, ignoring');
        return;
      }

      setState({
        isLoading: false,
        isAuthenticated: true,
        account,
        signer,
        connectionStatus: 'connected',
        authError: null,
      });
    }

    autoConnect().catch((err) => {
      debug.error(' Auto-connect failed:', err);
      if (!cancelled && !isStale(thisRequest)) {
        setState({ ...ANON_STATE, authError: 'unknown' });
      }
    });

    return () => {
      cancelled = true;
      // Invalidate any in-flight requests by starting a new one
      startRequest();
      unsubRef.current?.();
      unsubRef.current = null;
      refetchRef.current = null;
    };
  }, [inContainer, startRequest, isStale, dotNsIdentifier]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      refetch,
    }),
    [state, refetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('AuthProvider is required');
  return ctx;
}
