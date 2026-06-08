/**
 * Address utilities for Asset Hub ERC20 precompiles.
 *
 * Asset Hub exposes fungible assets as ERC20 contracts via precompile addresses.
 * The address is deterministically derived from the asset ID.
 */

/** Maximum valid asset ID (uint32 max) */
const MAX_ASSET_ID = 0xffffffff;

/**
 * Convert an Asset Hub asset ID to its ERC20 precompile address.
 *
 * The precompile address format for Asset Hub assets:
 * - First 4 bytes: asset ID (left-padded to 8 hex chars)
 * - Next 12 bytes: zeros (24 hex chars)
 * - Last 4 bytes: 0x01200000 (precompile identifier)
 *
 * @param assetId - The Asset Hub asset ID (must be a valid uint32: 0 to 4294967295)
 * @returns The 20-byte ERC20 precompile address as a hex string
 * @throws Error if assetId is invalid
 */
export function assetIdToErc20(assetId: number): `0x${string}` {
  // Validate input
  if (!Number.isFinite(assetId) || !Number.isInteger(assetId)) {
    throw new Error(`Invalid asset ID: ${assetId} (must be an integer)`);
  }
  if (assetId < 0 || assetId > MAX_ASSET_ID) {
    throw new Error(
      `Asset ID out of range: ${assetId} (must be 0 to ${MAX_ASSET_ID})`,
    );
  }

  // Pad asset ID to 8 hex characters (4 bytes)
  const assetIdHex = assetId.toString(16).padStart(8, '0');
  // 12 bytes of zeros
  const zeros = '000000000000000000000000';
  // Precompile identifier
  const precompileId = '01200000';

  return `0x${assetIdHex}${zeros}${precompileId}` as `0x${string}`;
}
