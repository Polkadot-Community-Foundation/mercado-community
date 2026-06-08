import type { PolkadotSigner } from 'polkadot-api';
import type { AccountConnectionStatus } from '@novasamatech/host-api-wrapper';
import { AccountId } from '@polkadot-api/substrate-bindings';
import type { AccountInfo } from '@mercado/types';

import { isInsideContainer } from './container';
import { debug } from './internal/debug';

/** Default DotNS identifier - can be overridden via requestHostAccount options */
const DEFAULT_dotNsIdentifier = 'mercado.dot';

export interface RequestHostAccountOptions {
  /** DotNS identifier for the product account (default: 'mercado.dot') */
  dotNsIdentifier?: string;
}

/** Specific error types returned by requestHostAccount */
export type HostAccountError =
  | 'not_in_container'
  | 'invalid_environment'
  | 'spektr_injection_failed'
  | 'no_product_account';

/**
 * Result from requestHostAccount - pairs account data with subscription function.
 * This ensures subscription lifecycle is tied to the provider instance.
 */
export interface HostAccountSuccess {
  account: AccountInfo;
  signer: PolkadotSigner;
  subscribe: (
    onStatusChange: (status: AccountConnectionStatus) => void,
  ) => () => void;
  refetch: () => Promise<{
    account: AccountInfo;
    signer: PolkadotSigner;
  } | null>;
}

/**
 * Partial result when environment is valid but no account yet.
 * Includes subscribe so we can observe future login events.
 */
export interface HostAccountPending {
  subscribe: (
    onStatusChange: (status: AccountConnectionStatus) => void,
  ) => () => void;
  refetch: () => Promise<{
    account: AccountInfo;
    signer: PolkadotSigner;
  } | null>;
}

export type HostAccountResult =
  | { ok: true; value: HostAccountSuccess }
  | { ok: false; error: HostAccountError; pending?: HostAccountPending };

/**
 * Connect to the Host container and retrieve the product account.
 * Returns account, signer, and subscription function as a unit.
 *
 * Follows mark3t pattern:
 * - Container check first
 * - Dynamic SDK import
 * - Environment check after import
 * - Inject extension
 * - Create provider and fetch account
 * - Return subscription paired with provider
 */
export async function requestHostAccount(
  options: RequestHostAccountOptions = {},
): Promise<HostAccountResult> {
  const dotNsIdentifier = options.dotNsIdentifier ?? DEFAULT_dotNsIdentifier;
  if (!isInsideContainer()) {
    debug.log(' Not in container');
    return { ok: false, error: 'not_in_container' };
  }

  const sdk = await import('@novasamatech/host-api-wrapper');
  const {
    sandboxProvider,
    sandboxTransport,
    createAccountsProvider,
    injectSpektrExtension,
  } = sdk;

  if (!sandboxProvider.isCorrectEnvironment()) {
    debug.log(' Not in correct environment');
    return { ok: false, error: 'invalid_environment' };
  }

  try {
    debug.log(' Injecting Spektr extension...');
    const injected = await injectSpektrExtension();
    if (!injected) {
      debug.warn(' Spektr extension injection returned false');
      return { ok: false, error: 'spektr_injection_failed' };
    }
    debug.log(' Spektr extension injected, fetching account...');
  } catch (error) {
    debug.error(' Error injecting Spektr extension:', error);
    return { ok: false, error: 'spektr_injection_failed' };
  }

  // Create provider once - subscription will be tied to this instance
  const accountsProvider = createAccountsProvider(sandboxTransport);

  // Helper to create subscribe/refetch functions tied to this provider
  const createPendingHandlers = (): HostAccountPending => ({
    subscribe: (onStatusChange) => {
      const sub =
        accountsProvider.subscribeAccountConnectionStatus(onStatusChange);
      return () => sub.unsubscribe();
    },
    // Note: Returns null for any failure (no account, rejected, network error).
    // AuthProvider treats null as 'no_product_account'. For reconnect scenarios
    // this is acceptable since subscription will trigger retry on status change.
    refetch: async () => {
      const refetchResult =
        await accountsProvider.getProductAccount(dotNsIdentifier);
      return refetchResult.match(
        (refetchData) => {
          const refetchAddress = AccountId().dec(refetchData.publicKey);
          return {
            account: {
              // name was removed in Host API v0.8 - use truncated address
              name: refetchAddress.slice(0, 8) + '…',
              address: refetchAddress,
            },
            signer: accountsProvider.getProductAccountSigner({
              dotNsIdentifier: dotNsIdentifier,
              derivationIndex: 0,
              publicKey: refetchData.publicKey,
            }),
          };
        },
        () => null,
      );
    },
  });

  const result = await accountsProvider.getProductAccount(dotNsIdentifier);

  return result.match(
    (data): HostAccountResult => {
      const { publicKey } = data;
      const address = AccountId().dec(publicKey);
      const account: AccountInfo = {
        // name was removed in Host API v0.8 - use truncated address
        name: address.slice(0, 8) + '…',
        address,
      };
      const signer = accountsProvider.getProductAccountSigner({
        dotNsIdentifier: dotNsIdentifier,
        derivationIndex: 0,
        publicKey,
      });

      debug.log(' Account fetched:', account.name);

      return {
        ok: true,
        value: {
          account,
          signer,
          ...createPendingHandlers(),
        },
      };
    },
    (): HostAccountResult => {
      debug.log(' No product account found, returning pending handlers');
      // Return subscribe/refetch so caller can observe future login events
      return {
        ok: false,
        error: 'no_product_account',
        pending: createPendingHandlers(),
      };
    },
  );
}
