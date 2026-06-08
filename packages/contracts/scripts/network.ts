/**
 * Standalone network utilities (no Hardhat dependency).
 * Used by seed.ts (tsx) and re-exported by util.ts (hardhat) for deploy.ts.
 */

/**
 * Retry an async operation with linear backoff.
 */
export async function withRetry<T>(
  label: string,
  fn: () => Promise<T>,
  { retries = 5, delayMs = 6_000 } = {},
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      if (attempt < retries) {
        const delay = delayMs * attempt;
        const msg =
          err instanceof Error
            ? err.message.slice(0, 80)
            : String(err).slice(0, 80);
        console.log(
          `⚠️  ${label}: ${msg} (attempt ${attempt}/${retries}), retrying in ${delay / 1000}s...`,
        );
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error(`${label}: exhausted ${retries} retries`);
}

/**
 * Get the env file name for a given network.
 */
export function getEnvFileForNetwork(networkName: string): string {
  switch (networkName) {
    case 'previewnet':
      return '.env.previewnet';
    case 'paseo':
      return '.env.paseo-local';
    case 'paseo-v2':
      return '.env.paseo-v2';
    default:
      return '.env.local';
  }
}

/**
 * Get chain-specific token info by network name (no Hardhat needed).
 */
export function getTokenInfoForNetwork(network: string): {
  decimals: number;
  tokenName: string;
} {
  switch (network) {
    case 'paseo':
    case 'paseo-v2':
      return { decimals: 10, tokenName: 'PAS' };
    case 'previewnet':
      return { decimals: 12, tokenName: 'WND' };
    default:
      return { decimals: 10, tokenName: 'PAS' };
  }
}

/**
 * Get Asset Hub WebSocket endpoint by network name.
 */
export function getWsEndpoint(network: string): string {
  switch (network) {
    case 'paseo':
    case 'paseo-v2':
      // Use official polkadot.io endpoint (consistent with web app)
      return 'wss://paseo-asset-hub-rpc.polkadot.io';
    case 'previewnet':
      return (
        process.env.PREVIEWNET_WS_URL ||
        'wss://previewnet.substrate.dev/asset-hub'
      );
    default:
      return 'wss://paseo-asset-hub-rpc.polkadot.io';
  }
}
