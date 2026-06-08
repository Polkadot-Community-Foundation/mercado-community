/**
 * Network configuration for Mercado.
 *
 * Centralizes chain-related configuration from environment variables
 * with type-safe defaults and validation.
 */

import { assetIdToErc20 } from '../lib/address';

/** Supported network identifiers */
export type NetworkId = 'paseo' | 'paseo-v2' | 'local' | 'previewnet';

/** Chain configuration */
export interface ChainConfig {
  /** Network identifier */
  network: NetworkId;
  /** Genesis hash for chain identification */
  genesisHash: `0x${string}`;
  /** WebSocket RPC endpoint */
  wsRpcEndpoint: string;
  /** Bulletin Chain endpoint */
  bulletinEndpoint: string;
  /** Optional: Relay chain spec URL for smoldot */
  relayChainSpec?: string;
  /** Optional: Parachain spec URL for smoldot */
  paraChainSpec?: string;
}

/** Contract addresses */
export interface ContractAddresses {
  core?: `0x${string}`;
  ratings?: `0x${string}`;
  disputes?: `0x${string}`;
  restaurantMeta?: `0x${string}`;
  mockMobRule?: `0x${string}`;
}

/** Token configuration */
export interface TokenConfig {
  symbol: string;
  decimals: number;
  /** Asset Hub asset ID for pUSD */
  assetId: number;
  /** ERC20 precompile address derived from asset ID */
  address: `0x${string}`;
}

/** Complete network configuration */
export interface NetworkConfig {
  chain: ChainConfig;
  contracts: ContractAddresses;
  token: TokenConfig;
}

/** Known genesis hashes */
export const KNOWN_GENESIS_HASHES = {
  /** Paseo Asset Hub (original/v1) */
  paseoAssetHub:
    '0xd6eec26135305a8ad257a20d003357284c8aa03d0bdb2b357ab0a22371e11ef2',
  /** Paseo Next V2 Asset Hub */
  paseoAssetHubV2:
    '0xbf0488dbe9daa1de1c08c5f743e26fdc2a4ecd74cf87dd1b4b1eeb99ae4ef19f',
} as const;

/** Default RPC endpoints */
const DEFAULT_ENDPOINTS: Record<NetworkId, string> = {
  paseo: 'wss://paseo-asset-hub-next-rpc.polkadot.io',
  'paseo-v2': 'wss://paseo-asset-hub-next-rpc.polkadot.io', // Same RPC, different genesis
  local: 'ws://127.0.0.1:9944',
  previewnet: 'wss://previewnet.substrate.dev/asset-hub',
};

/** Default genesis hashes per network */
const DEFAULT_GENESIS_HASHES: Record<NetworkId, `0x${string}`> = {
  paseo: KNOWN_GENESIS_HASHES.paseoAssetHub,
  'paseo-v2': KNOWN_GENESIS_HASHES.paseoAssetHubV2,
  local: '0x0000000000000000000000000000000000000000000000000000000000000000',
  previewnet:
    '0x0000000000000000000000000000000000000000000000000000000000000000',
};

/**
 * Load network configuration from environment variables.
 * Provides sensible defaults for Paseo Asset Hub.
 *
 * Set VITE_NETWORK=paseo-v2 to use Paseo Next V2 with updated genesis hash.
 */
export function loadNetworkConfig(): NetworkConfig {
  const network = (import.meta.env.VITE_NETWORK || 'paseo') as NetworkId;
  const genesisHash =
    (import.meta.env.VITE_GENESIS_HASH as `0x${string}`) ||
    DEFAULT_GENESIS_HASHES[network];

  return {
    chain: {
      network,
      genesisHash,
      wsRpcEndpoint:
        import.meta.env.VITE_WS_RPC_ENDPOINT || DEFAULT_ENDPOINTS[network],
      bulletinEndpoint:
        import.meta.env.VITE_BULLETIN_ENDPOINT ||
        'wss://paseo-bulletin-next-rpc.polkadot.io',
      relayChainSpec: import.meta.env.VITE_RELAY_CHAIN_SPEC,
      paraChainSpec: import.meta.env.VITE_PARA_CHAIN_SPEC,
    },
    contracts: {
      core: import.meta.env.VITE_MERCADO_ADDRESS as `0x${string}` | undefined,
      ratings: import.meta.env.VITE_MERCADO_RATINGS_ADDRESS as
        | `0x${string}`
        | undefined,
      disputes: import.meta.env.VITE_MERCADO_DISPUTES_ADDRESS as
        | `0x${string}`
        | undefined,
      restaurantMeta: import.meta.env.VITE_RESTAURANT_META_ADDRESS as
        | `0x${string}`
        | undefined,
      mockMobRule: import.meta.env.VITE_MOCKMOBRULE_ADDRESS as
        | `0x${string}`
        | undefined,
    },
    token: (() => {
      const envAssetId = import.meta.env.VITE_PUSD_ASSET_ID;
      // Use explicit check to allow asset ID 0 if configured
      const assetId =
        envAssetId !== undefined && envAssetId !== ''
          ? Number(envAssetId)
          : 50000413;

      // Validate the asset ID
      if (!Number.isFinite(assetId) || !Number.isInteger(assetId)) {
        throw new Error(`Invalid VITE_PUSD_ASSET_ID: ${envAssetId}`);
      }

      const envDecimals = import.meta.env.VITE_PUSD_DECIMALS;
      const decimals =
        envDecimals !== undefined && envDecimals !== ''
          ? Number(envDecimals)
          : 6;

      return {
        symbol: import.meta.env.VITE_PUSD_SYMBOL || 'pUSD',
        decimals,
        assetId,
        address: assetIdToErc20(assetId),
      };
    })(),
  };
}

/** Singleton network config instance */
let _config: NetworkConfig | null = null;

/** Get the network configuration (cached) */
export function getNetworkConfig(): NetworkConfig {
  if (!_config) {
    _config = loadNetworkConfig();
  }
  return _config;
}

/** Check if light client is available for current network */
export function isLightClientAvailable(): boolean {
  const config = getNetworkConfig();

  // Available if we have explicit chain specs
  if (config.chain.relayChainSpec && config.chain.paraChainSpec) {
    return true;
  }

  // Available for known chains with bundled specs (V1 and V2)
  return (
    config.chain.genesisHash === KNOWN_GENESIS_HASHES.paseoAssetHub ||
    config.chain.genesisHash === KNOWN_GENESIS_HASHES.paseoAssetHubV2
  );
}
