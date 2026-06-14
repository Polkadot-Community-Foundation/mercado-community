/**
 * Host API permission requests for external HTTP services.
 *
 * When running inside the Polkadot Triangle (Desktop, Mobile, Web browser),
 * we need to request permission to access external HTTP services.
 */
import { isInsideContainer } from './container';
import { debug } from './internal/debug';

/**
 * External services that require permission when running in host environment.
 *
 * Host API v0.7+ uses domain patterns (not full URLs):
 * - 'api.example.com' - exact domain
 * - '*.example.com' - subdomain wildcard
 */
const REQUIRED_PERMISSIONS = [
  'nominatim.openstreetmap.org', // Reverse geocoding for location
  'summit-ipfs.polkadot.io', // Summit IPFS gateway for menu/evidence image display
];

/**
 * Request permissions for external HTTP services.
 * Should be called early in app lifecycle when running in host.
 *
 * Permissions are requested individually - if one fails, others can still succeed.
 */
export async function requestRemotePermissions(): Promise<void> {
  if (!isInsideContainer()) {
    return; // Not in host, no permissions needed
  }

  // Dynamically import SDK and validate environment before using Host API
  const sdk = await import('@novasamatech/host-api-wrapper');
  const { sandboxProvider, hostApi } = sdk;

  if (!sandboxProvider.isCorrectEnvironment()) {
    debug.log(' Not in correct environment for permissions');
    return;
  }

  for (const domain of REQUIRED_PERMISSIONS) {
    try {
      // Uses remote_permission protocol method
      // Host API v0.7+: 'Remote' variant with array of domain patterns
      const result = hostApi.permission({
        tag: 'v1',
        value: { tag: 'Remote', value: [domain] },
      });
      await result.match(
        (response) => {
          // Response is versioned: { tag: "v1", value: boolean }
          if (response.value) {
            debug.log(` Permission granted for: ${domain}`);
          } else {
            debug.warn(` Permission request returned false for: ${domain}`);
          }
        },
        () => {
          debug.warn(` Permission denied for: ${domain}`);
        },
      );
    } catch (err) {
      // Host may not support this permission type yet, or transport failed
      debug.warn(` Permission request failed for ${domain}:`, err);
    }
  }
}
