/// <reference types="vite/client" />

// Host API globals (set by Polkadot Triangle containers)
declare global {
  interface Window {
    __HOST_WEBVIEW_MARK__?: boolean;
    __HOST_API_PORT__?: number;
  }
}

interface ImportMetaEnv {
  // Network configuration
  readonly VITE_NETWORK?: 'paseo' | 'local' | 'previewnet';
  readonly VITE_GENESIS_HASH?: string;
  readonly VITE_WS_RPC_ENDPOINT?: string;

  // Chain specs for smoldot light client
  readonly VITE_RELAY_CHAIN_SPEC?: string;
  readonly VITE_PARA_CHAIN_SPEC?: string;

  // Contract addresses
  readonly VITE_MERCADO_ADDRESS?: string;
  readonly VITE_MERCADO_RATINGS_ADDRESS?: string;
  readonly VITE_MERCADO_DISPUTES_ADDRESS?: string;
  readonly VITE_RESTAURANT_META_ADDRESS?: string;
  readonly VITE_MOCKMOBRULE_ADDRESS?: string;

  // External services
  readonly VITE_BULLETIN_ENDPOINT?: string;
  readonly VITE_IPFS_GATEWAY?: string;

  // Token configuration
  readonly VITE_TOKEN_SYMBOL?: string;
  readonly VITE_TOKEN_DECIMALS?: string;

  // Feature flags
  readonly VITE_USE_REAL_CONTRACTS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
