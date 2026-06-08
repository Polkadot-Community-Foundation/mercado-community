import { keccak256, encodeAbiParameters, pad, toHex } from 'viem';

/**
 * Pickup code utilities for order verification.
 *
 * DESIGN: The 6-digit display code IS the secret (zero-padded to bytes32).
 * This enables the customer to complete the order using only the displayed code.
 *
 * Flow:
 * 1. Restaurant marks order READY → generatePickupCode() → returns { displayCode, secret, hash }
 * 2. Restaurant shares displayCode with customer (e.g., "847291")
 * 3. Customer enters displayCode → codeToSecret() → returns bytes32 secret
 * 4. Customer calls completeOrder(orderId, secret) → contract verifies hash
 *
 * Security note: 6 digits = 1M possibilities. Brute-force at 1 RPC/sec takes ~12 days.
 * The code is only valid for a short window (order lifecycle), making brute-force impractical.
 */

/**
 * Length of the display code shown to users (e.g., "847291")
 */
export const DISPLAY_CODE_LENGTH = 6;

/**
 * Generated pickup code data
 */
export interface PickupCodeData {
  /** Human-readable code to display (6 digits) */
  displayCode: string;
  /** Full secret used for verification (32 bytes hex) - derived from displayCode */
  secret: `0x${string}`;
  /** Hash stored on-chain: keccak256(orderId, secret) */
  hash: `0x${string}`;
}

/**
 * Convert a display code to the bytes32 secret for contract verification.
 * The display code is zero-padded to 32 bytes.
 *
 * @param displayCode - The 6-digit display code
 * @returns bytes32 hex string
 */
export function codeToSecret(displayCode: string): `0x${string}` {
  const numericCode = parseInt(displayCode.replace(/\D/g, ''), 10);
  if (isNaN(numericCode) || numericCode < 0) {
    throw new Error('Invalid pickup code');
  }
  // Pad the numeric code to 32 bytes (uint256)
  return pad(toHex(BigInt(numericCode)), { size: 32 });
}

/**
 * Generate a new pickup code for an order.
 *
 * @param orderId - The order ID (as string, number, or UUID)
 * @returns PickupCodeData with displayCode, secret, and hash
 */
export function generatePickupCode(orderId: string | number): PickupCodeData {
  // Convert orderId to BigInt for hashing
  // Supports: numeric strings, numbers, and UUID strings
  let orderIdBigInt: bigint;
  const orderIdStr = String(orderId);

  // Check if it's a numeric value
  if (/^\d+$/.test(orderIdStr)) {
    orderIdBigInt = BigInt(orderIdStr);
    if (orderIdBigInt <= 0n) {
      throw new Error('Order ID must be positive');
    }
  } else {
    // For non-numeric IDs (like UUIDs), hash them to get a deterministic bigint
    // Use the first 8 bytes of keccak256 hash
    const hash = keccak256(
      encodeAbiParameters([{ type: 'string' }], [orderIdStr]),
    );
    // Take first 16 hex chars (8 bytes) after 0x prefix
    orderIdBigInt = BigInt('0x' + hash.slice(2, 18));
  }

  // Generate random 6-digit code (100000-999999 to avoid leading zeros confusion)
  const randomValue = crypto.getRandomValues(new Uint32Array(1))[0];
  const displayNumber = 100000 + (randomValue % 900000);
  const displayCode = displayNumber.toString();

  // The secret IS the display code, zero-padded to bytes32
  const secret = codeToSecret(displayCode);

  // Compute hash: keccak256(abi.encode(orderId, secret))
  const hash = keccak256(
    encodeAbiParameters(
      [{ type: 'uint256' }, { type: 'bytes32' }],
      [orderIdBigInt, secret],
    ),
  );

  return { displayCode, secret, hash };
}

/**
 * Verify a pickup code matches the expected hash.
 * Used for client-side validation before sending transaction.
 *
 * @param orderId - The order ID (numeric or UUID string)
 * @param displayCode - The 6-digit display code entered by customer
 * @param expectedHash - The hash stored on-chain
 * @returns true if the code hashes to expectedHash
 */
export function verifyPickupCode(
  orderId: string | number,
  displayCode: string,
  expectedHash: string,
): boolean {
  try {
    // Convert orderId to BigInt (same logic as generatePickupCode)
    const orderIdStr = String(orderId);
    let orderIdBigInt: bigint;

    if (/^\d+$/.test(orderIdStr)) {
      orderIdBigInt = BigInt(orderIdStr);
    } else {
      // For non-numeric IDs (like UUIDs), hash them to get a deterministic bigint
      const hash = keccak256(
        encodeAbiParameters([{ type: 'string' }], [orderIdStr]),
      );
      orderIdBigInt = BigInt('0x' + hash.slice(2, 18));
    }

    const secret = codeToSecret(displayCode);
    const computedHash = keccak256(
      encodeAbiParameters(
        [{ type: 'uint256' }, { type: 'bytes32' }],
        [orderIdBigInt, secret],
      ),
    );
    return computedHash.toLowerCase() === expectedHash.toLowerCase();
  } catch {
    return false;
  }
}

/**
 * Zero bytes32 constant for checking if pickup code is set.
 */
export const ZERO_BYTES32 =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Check if an order has a pickup code set.
 *
 * @param pickupCodeHash - The hash from the order
 * @returns true if a pickup code is set
 */
export function hasPickupCode(pickupCodeHash: string | undefined): boolean {
  return (
    pickupCodeHash !== undefined &&
    pickupCodeHash !== ZERO_BYTES32 &&
    pickupCodeHash !== ''
  );
}
