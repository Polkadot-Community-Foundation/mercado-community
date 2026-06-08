/**
 * Transaction signing utilities with timeout and error handling.
 *
 * Provides a wrapper around signAndSubmit that:
 * - Adds configurable timeout to prevent indefinite hanging
 * - Detects user rejection to distinguish from other errors
 * - Returns typed errors for better error handling in UI
 */
import type { PolkadotSigner, Transaction } from 'polkadot-api';

const DEFAULT_TIMEOUT_MS = 60000;

/**
 * Error thrown when user rejects the transaction in their wallet.
 */
export class UserRejectedError extends Error {
  constructor(message = 'User rejected the transaction') {
    super(message);
    this.name = 'UserRejectedError';
  }
}

/**
 * Error thrown when transaction signing times out.
 */
export class TransactionTimeoutError extends Error {
  constructor(message = 'Transaction signing timed out') {
    super(message);
    this.name = 'TransactionTimeoutError';
  }
}

/**
 * Check if an error indicates user rejection.
 *
 * Host API and wallet extensions use various error messages/codes
 * to indicate the user cancelled or rejected the transaction.
 */
export function isUserRejection(error: unknown): boolean {
  if (!error) return false;

  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  // Common rejection patterns from various wallet sources
  const rejectionPatterns = [
    'user rejected',
    'user denied',
    'user cancelled',
    'user canceled',
    'cancelled by user',
    'canceled by user',
    'rejected by user',
    'denied by user',
    'action cancelled',
    'action canceled',
    'signing cancelled',
    'signing canceled',
    'user declined',
  ];

  return rejectionPatterns.some((pattern) => message.includes(pattern));
}

/**
 * Helper to create a timeout promise that rejects with TransactionTimeoutError.
 */
function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new TransactionTimeoutError()), ms);
  });
}

/**
 * Sign and submit a transaction with timeout and user rejection handling.
 *
 * @param tx - The transaction to sign and submit
 * @param signer - The PolkadotSigner to use for signing
 * @param timeoutMs - Timeout in milliseconds (default: 60000)
 * @returns Promise that resolves when transaction is submitted
 * @throws UserRejectedError if user rejects the transaction
 * @throws TransactionTimeoutError if signing times out
 * @throws Error for other transaction failures
 *
 * @example
 * ```ts
 * try {
 *   await signAndSubmitWithTimeout(tx, signer);
 * } catch (err) {
 *   if (err instanceof UserRejectedError) {
 *     // Handle user cancellation gracefully
 *   } else if (err instanceof TransactionTimeoutError) {
 *     // Handle timeout
 *   } else {
 *     // Handle other errors
 *   }
 * }
 * ```
 */
export async function signAndSubmitWithTimeout(
  tx: Transaction,
  signer: PolkadotSigner,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<void> {
  try {
    await Promise.race([tx.signAndSubmit(signer), createTimeout(timeoutMs)]);
  } catch (err) {
    if (err instanceof TransactionTimeoutError) {
      throw err;
    }
    if (isUserRejection(err)) {
      throw new UserRejectedError();
    }
    throw err;
  }
}
