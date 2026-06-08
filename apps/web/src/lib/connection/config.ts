/**
 * Connection configuration from environment variables.
 */

// Contract addresses from env
export const CORE_ADDRESS = import.meta.env.VITE_MERCADO_ADDRESS as
  | `0x${string}`
  | undefined;
export const RATINGS_ADDRESS = import.meta.env.VITE_MERCADO_RATINGS_ADDRESS as
  | `0x${string}`
  | undefined;
export const DISPUTES_ADDRESS = import.meta.env
  .VITE_MERCADO_DISPUTES_ADDRESS as `0x${string}` | undefined;
export const META_ADDRESS = import.meta.env.VITE_RESTAURANT_META_ADDRESS as
  | `0x${string}`
  | undefined;
export const MATCHMAKERS_ADDRESS = import.meta.env.VITE_MATCHMAKERS_ADDRESS as
  | `0x${string}`
  | undefined;
export const GENESIS_HASH = import.meta.env.VITE_GENESIS_HASH as
  | `0x${string}`
  | undefined;

// RPC endpoints
export const WS_RPC_ENDPOINT =
  import.meta.env.VITE_WS_RPC_ENDPOINT ||
  'wss://paseo-asset-hub-rpc.polkadot.io';

// Chain spec URLs for smoldot (optional)
export const RELAY_CHAIN_SPEC = import.meta.env.VITE_RELAY_CHAIN_SPEC as
  | string
  | undefined;
export const PARA_CHAIN_SPEC = import.meta.env.VITE_PARA_CHAIN_SPEC as
  | string
  | undefined;

// Storage key for persisting connection mode preference
export const CONNECTION_MODE_STORAGE_KEY = 'mercado:connectionMode';

// Known genesis hashes
export const PASEO_ASSET_HUB_GENESIS =
  '0xd6eec26135305a8ad257a20d003357284c8aa03d0bdb2b357ab0a22371e11ef2';

/** Paseo Next V2 genesis hash (from truapi well-known-chains) */
export const PASEO_ASSET_HUB_V2_GENESIS =
  '0xbf0488dbe9daa1de1c08c5f743e26fdc2a4ecd74cf87dd1b4b1eeb99ae4ef19f';
