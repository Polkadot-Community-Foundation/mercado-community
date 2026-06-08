/**
 * Bulletin Chain configuration from environment variables.
 * Centralized to avoid duplication across containers/hooks.
 */
export const BULLETIN_ENDPOINT = import.meta.env.VITE_BULLETIN_ENDPOINT as
  | string
  | undefined;

/**
 * IPFS gateway URL for constructing display URLs (e.g., img src).
 * Note: This is ONLY for browser display - data fetching should use UA-mediated APIs.
 */
export const IPFS_GATEWAY_FOR_DISPLAY =
  (import.meta.env.VITE_IPFS_GATEWAY as string | undefined) ||
  'https://ipfs.io/ipfs/';

/** Construct a display URL for an IPFS CID (for img src, etc.) */
export function cidToDisplayUrl(cid: string): string {
  return `${IPFS_GATEWAY_FOR_DISPLAY}${cid}`;
}

export function isBulletinConfigured(): boolean {
  return !!BULLETIN_ENDPOINT;
}
