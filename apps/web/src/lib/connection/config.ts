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
  'wss://summit-asset-hub-rpc.polkadot.io';

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
/** Summit Asset Hub genesis hash (read live 2026-06-11 via chain_getBlockHash(0)) */
export const SUMMIT_ASSET_HUB_GENESIS =
  '0xf388dc6d6cdf6fb77eac3c4a91f31bc0c8642b142f1a757512ab7849f9f70660';
