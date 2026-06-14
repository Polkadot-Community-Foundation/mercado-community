/**
 * Connection mode detection and chain spec loading.
 */
import { isInsideContainer } from '@mercado/core-hooks';

import {
  CONNECTION_MODE_STORAGE_KEY,
  RELAY_CHAIN_SPEC,
  PARA_CHAIN_SPEC,
} from './config';

export type ConnectionMode = 'host' | 'rpc' | 'lightclient';

/**
 * Detect initial connection mode based on environment.
 *
 * Priority:
 * 1. Host mode if inside container with valid SDK environment
 * 2. Stored preference from localStorage
 * 3. Default to RPC
 */
export async function detectConnectionMode(): Promise<ConnectionMode> {
  if (typeof window === 'undefined') return 'rpc';

  // In container with proper Host API environment, use host mode
  // This requires both iframe/container detection AND valid SDK environment
  if (isInsideContainer()) {
    const { sandboxProvider } = await import('@novasamatech/host-api-wrapper');
    if (sandboxProvider.isCorrectEnvironment()) {
      return 'host';
    }
  }

  // Outside container or invalid SDK environment: check stored preference
  try {
    const stored = localStorage.getItem(CONNECTION_MODE_STORAGE_KEY);
    if (stored === 'lightclient' || stored === 'rpc') {
      return stored;
    }
  } catch {
    // localStorage might be unavailable
  }

  return 'rpc';
}

export interface ChainSpecs {
  relaySpec: string;
  paraSpec: string;
}

/**
 * Load chain specs for smoldot light client.
 *
 * Summit is a private network with no bundled @polkadot-api/known-chains
 * chainspec, so the only supported path is explicit relay/para chain spec URLs
 * provided via VITE_RELAY_CHAIN_SPEC / VITE_PARA_CHAIN_SPEC. Without those,
 * light-client mode is unavailable and the app falls back to RPC.
 */
export async function loadChainSpecs(): Promise<ChainSpecs | null> {
  // Explicit URLs from env
  if (RELAY_CHAIN_SPEC && PARA_CHAIN_SPEC) {
    try {
      const [relayRes, paraRes] = await Promise.all([
        fetch(RELAY_CHAIN_SPEC),
        fetch(PARA_CHAIN_SPEC),
      ]);
      if (!relayRes.ok || !paraRes.ok) {
        console.warn(
          '[connection/detect] Failed to fetch chain specs from URLs',
        );
        return null;
      }
      return {
        relaySpec: await relayRes.text(),
        paraSpec: await paraRes.text(),
      };
    } catch (err) {
      console.warn('[connection/detect] Error fetching chain specs:', err);
      return null;
    }
  }

  return null;
}
