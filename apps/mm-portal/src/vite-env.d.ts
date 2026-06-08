/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MERCADO_ADDRESS?: string;
  readonly VITE_MATCHMAKERS_ADDRESS?: string;
  readonly VITE_WS_RPC_ENDPOINT?: string;
  readonly VITE_MARKETPLACE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
