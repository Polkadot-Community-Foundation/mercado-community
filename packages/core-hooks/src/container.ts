/**
 * Detects whether the app MAY be running inside a Host container.
 *
 * This is a quick heuristic check for:
 * 1. Webview mark (Polkadot Desktop native) - strong signal
 * 2. Host API port (cross-origin message passing) - strong signal
 * 3. Iframe detection - weak signal, may be ordinary embed
 *
 * IMPORTANT: This returns true for ANY iframe, which over-detects.
 * For Host API operations, ALWAYS also check sandboxProvider.isCorrectEnvironment()
 * after dynamic SDK import. This function is only for initial gating.
 */
export function isInsideContainer(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for webview mark (set by native containers like Polkadot Desktop)
  // This is a strong signal - check first
  if (window.__HOST_WEBVIEW_MARK__ === true) return true;

  // Check for Host API port (set for cross-origin communication)
  // This is a strong signal
  if (window.__HOST_API_PORT__ != null) return true;

  // Iframe detection - weak signal, could be ordinary embed
  // Still return true to allow SDK environment check to make final determination
  if (window !== window.top) return true;

  return false;
}

/**
 * Check if there are strong Host container markers present.
 * Use this for UI decisions where iframe-only shouldn't trigger Host-specific messaging.
 */
export function hasHostMarkers(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.__HOST_WEBVIEW_MARK__ === true || window.__HOST_API_PORT__ != null
  );
}

/**
 * Check if running in Polkadot Desktop (native webview).
 *
 * IMPORTANT: createPapiProvider() from @novasamatech/host-api-wrapper routes via
 * the deprecated host_jsonrpc_message_* channel which is NOT wired into Desktop's
 * chainConnectionManager. Use direct WebSocket when this returns true.
 *
 * @see https://github.com/nicetester/polkadot-product-sdk/issues/TBD
 */
export function isDesktop(): boolean {
  if (typeof window === 'undefined') return false;
  return window.__HOST_WEBVIEW_MARK__ === true;
}
