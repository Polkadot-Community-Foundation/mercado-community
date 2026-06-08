// Host API globals (set by Polkadot Triangle containers)
declare global {
  interface Window {
    __HOST_WEBVIEW_MARK__?: boolean;
    __HOST_API_PORT__?: number;
  }
}

export {};
