/**
 * ContractsContext - Provides access to deployed smart contracts.
 *
 * Manages the polkadot-api client connection and creates contract instances
 * for MercadoRatings, MercadoDisputes, and RestaurantMeta.
 *
 * Supports three connection modes:
 * - Host API (when running in container with __HOST_API_PORT__)
 * - Direct WebSocket RPC (default standalone)
 * - Light client via smoldot (user-selectable, offline-capable)
 *
 * Uses global singletons to survive React StrictMode double-effects and HMR,
 * preventing duplicate chainHead subscriptions that exhaust RPC limits.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import type { PolkadotClient } from 'polkadot-api';
import { createClient } from 'polkadot-api';
import { getWsProvider } from 'polkadot-api/ws-provider/web';
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';
import { createPapiProvider } from '@novasamatech/host-api-wrapper';
import { isInsideContainer, isDesktop } from '@mercado/core-hooks';

import { type EvmContract, type ReviveTypedApi } from '../lib/contracts';
import {
  GENESIS_HASH,
  WS_RPC_ENDPOINT,
  CONNECTION_MODE_STORAGE_KEY,
  detectConnectionMode,
  loadChainSpecs,
  createContractInstances,
  type ConnectionMode,
} from '../lib/connection';

// Global singletons to survive React StrictMode double-effects and HMR.
// __mercadoInitPromise is set synchronously (before any await) to prevent
// StrictMode's second effect from starting a duplicate connection.
declare global {
  var __mercadoClient: PolkadotClient | undefined;

  var __mercadoTypedApi: ReviveTypedApi | undefined;

  var __mercadoInitPromise: Promise<void> | undefined;

  var __mercadoNativeToEvmRatio: bigint | undefined;

  var __mercadoConnectionMode: ConnectionMode | undefined;
}

interface ContractsContextValue {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connectionMode: ConnectionMode;
  /** Whether running inside a host container (mode switching disabled) */
  isInsideContainer: boolean;
  /** Switch connection mode (only available outside container) */
  setConnectionMode: (mode: 'rpc' | 'lightclient') => void;
  core: EvmContract | null;
  ratings: EvmContract | null;
  disputes: EvmContract | null;
  restaurantMeta: EvmContract | null;
  matchmakers: EvmContract | null;
  nativeToEvmRatio: bigint;
  /** Raw typed API for pallet queries */
  typedApi: ReviveTypedApi | null;
}

const ContractsContext = createContext<ContractsContextValue | null>(null);

export type { ConnectionMode };

export function useContracts(): ContractsContextValue {
  const ctx = useContext(ContractsContext);
  if (!ctx) {
    throw new Error('ContractsProvider is required');
  }
  return ctx;
}

/** Destroy the existing client and clear all globals. */
function destroyChain(): void {
  try {
    globalThis.__mercadoClient?.destroy();
  } catch {
    // ignore — client may already be destroyed
  }
  globalThis.__mercadoClient = undefined;
  globalThis.__mercadoTypedApi = undefined;
  globalThis.__mercadoInitPromise = undefined;
  globalThis.__mercadoNativeToEvmRatio = undefined;
  globalThis.__mercadoConnectionMode = undefined;
}

/**
 * One-shot chain initialization. Sets global client and typedApi.
 * Called once and cached as __mercadoInitPromise to survive StrictMode + HMR.
 */
async function initChain(mode: ConnectionMode): Promise<void> {
  let provider;

  if (mode === 'host' && GENESIS_HASH) {
    // Desktop's chainConnectionManager doesn't support createPapiProvider's routing
    // (it uses deprecated host_jsonrpc_message_* channel). Fall back to direct RPC.
    if (isDesktop()) {
      console.log('[ContractsContext] Desktop detected, using RPC fallback');
      provider = withPolkadotSdkCompat(getWsProvider(WS_RPC_ENDPOINT));
    } else {
      console.log('[ContractsContext] Connecting via Host API');
      provider = createPapiProvider(GENESIS_HASH);
    }
  } else if (mode === 'lightclient') {
    console.log('[ContractsContext] Connecting via light client (smoldot)');
    const specs = await loadChainSpecs();

    if (!specs) {
      throw new Error('Light client unavailable: no chain specs configured');
    }

    const { start } = await import('polkadot-api/smoldot');
    const { getSmProvider } = await import('polkadot-api/sm-provider');

    const smoldot = start();
    const relay = await smoldot.addChain({ chainSpec: specs.relaySpec });
    provider = getSmProvider(
      await smoldot.addChain({
        chainSpec: specs.paraSpec,
        potentialRelayChains: [relay],
      }),
    );
  } else {
    console.log(`[ContractsContext] Connecting via RPC (${WS_RPC_ENDPOINT})`);
    provider = withPolkadotSdkCompat(getWsProvider(WS_RPC_ENDPOINT));
  }

  // Type assertions needed due to polkadot-api version mismatch:
  // - @novasamatech/host-api-wrapper@0.8.x depends on polkadot-api@2.x
  // - This app uses polkadot-api@1.23.x (via @mercado/bulletin descriptors)
  // The runtime types are compatible, but TypeScript sees them as different.
  // TODO: Upgrade polkadot-api to 2.x when @mercado/bulletin is updated.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalThis.__mercadoClient = createClient(provider as any);
  // getUnsafeApi() returns generic TypedApi; we narrow to our ReviveTypedApi interface
  globalThis.__mercadoTypedApi =
    globalThis.__mercadoClient.getUnsafeApi() as unknown as ReviveTypedApi;

  // Get NativeToEvmRatio for value conversion
  try {
    const constants = globalThis.__mercadoTypedApi
      .constants as ReviveTypedApi['constants'];
    if (constants?.Revive?.NativeToEthRatio) {
      globalThis.__mercadoNativeToEvmRatio =
        await constants.Revive.NativeToEthRatio();
    }
  } catch {
    // Use default ratio
    globalThis.__mercadoNativeToEvmRatio = 1_000_000n;
  }
}

export function ContractsProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typedApi, setTypedApi] = useState<ReviveTypedApi | null>(null);
  const [nativeToEvmRatio, setNativeToEvmRatio] = useState<bigint>(1n);
  const [connectionMode, setConnectionModeState] =
    useState<ConnectionMode>('rpc');
  const inContainer = useMemo(() => isInsideContainer(), []);

  // Initial connection - uses global singleton to prevent StrictMode duplicates
  useEffect(() => {
    let destroyed = false;

    // Deduplicate: first effect creates the promise (synchronously, before any await).
    // StrictMode's second effect just awaits the same promise.
    if (!globalThis.__mercadoInitPromise) {
      globalThis.__mercadoInitPromise = (async () => {
        const mode = await detectConnectionMode();
        globalThis.__mercadoConnectionMode = mode;
        await initChain(mode);
      })();
    }

    globalThis.__mercadoInitPromise
      .then(() => {
        if (destroyed) return;
        setTypedApi(globalThis.__mercadoTypedApi ?? null);
        setNativeToEvmRatio(globalThis.__mercadoNativeToEvmRatio ?? 1_000_000n);
        setConnectionModeState(globalThis.__mercadoConnectionMode ?? 'rpc');
        setIsConnected(!!globalThis.__mercadoClient);
        setIsLoading(false);
      })
      .catch((err) => {
        if (destroyed) return;
        console.error('[ContractsContext] Connection failed:', err);
        setError(err instanceof Error ? err.message : 'Connection failed');
        setIsLoading(false);
      });

    return () => {
      destroyed = true;
    };
  }, []);

  // Mode switching (only outside container)
  const setConnectionMode = useCallback(
    (newMode: 'rpc' | 'lightclient') => {
      if (inContainer) return;
      if (newMode === connectionMode) return;

      // Persist preference
      try {
        localStorage.setItem(CONNECTION_MODE_STORAGE_KEY, newMode);
      } catch {
        // localStorage might be unavailable
      }

      // Tear down current connection and reconnect with new mode
      destroyChain();
      setIsConnected(false);
      setTypedApi(null);
      setIsLoading(true);

      globalThis.__mercadoConnectionMode = newMode;
      globalThis.__mercadoInitPromise = initChain(newMode);

      globalThis.__mercadoInitPromise
        .then(() => {
          setTypedApi(globalThis.__mercadoTypedApi ?? null);
          setNativeToEvmRatio(
            globalThis.__mercadoNativeToEvmRatio ?? 1_000_000n,
          );
          setConnectionModeState(newMode);
          setIsConnected(!!globalThis.__mercadoClient);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('[ContractsContext] Reconnection failed:', err);
          setError(err instanceof Error ? err.message : 'Reconnection failed');
          setIsLoading(false);
        });
    },
    [inContainer, connectionMode],
  );

  // Create contract instances
  const contracts = useMemo(() => {
    if (!typedApi || !isConnected) {
      return {
        core: null,
        ratings: null,
        disputes: null,
        restaurantMeta: null,
        matchmakers: null,
      };
    }

    const getNativeToEvmRatio = () => nativeToEvmRatio;
    return createContractInstances(typedApi, getNativeToEvmRatio);
  }, [typedApi, isConnected, nativeToEvmRatio]);

  const value = useMemo(
    () => ({
      isConnected,
      isLoading,
      error,
      connectionMode,
      isInsideContainer: inContainer,
      setConnectionMode,
      nativeToEvmRatio,
      typedApi,
      ...contracts,
    }),
    [
      isConnected,
      isLoading,
      error,
      connectionMode,
      inContainer,
      setConnectionMode,
      nativeToEvmRatio,
      typedApi,
      contracts,
    ],
  );

  return (
    <ContractsContext.Provider value={value}>
      {children}
    </ContractsContext.Provider>
  );
}
