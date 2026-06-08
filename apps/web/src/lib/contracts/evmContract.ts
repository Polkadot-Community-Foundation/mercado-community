/**
 * EVM Contract interaction via polkadot-api ReviveApi.
 *
 * Uses viem for ABI encoding/decoding and ReviveApi.eth_transact for execution.
 * Simplified version of mark3t's implementation.
 */
import type { Transaction, FixedSizeBinary } from 'polkadot-api';
import { Binary } from 'polkadot-api';
import { AccountId } from '@polkadot-api/substrate-bindings';
import {
  decodeFunctionResult,
  encodeFunctionData,
  decodeErrorResult,
  decodeAbiParameters,
  keccak256,
  toHex,
} from 'viem';
import type { Abi } from 'viem';

/** Asset account balance info from Assets pallet */
export interface AssetAccountInfo {
  balance: bigint;
  status: { type: string };
  reason: { type: string };
  extra: unknown;
}

/**
 * Minimal interface for the PAPI TypedApi with Revive support.
 * Using explicit types to avoid descriptor dependency issues.
 */
export interface ReviveTypedApi {
  apis: {
    ReviveApi: {
      eth_transact: (
        tx: EthTransactTx,
        options: { at: string },
      ) => Promise<EthTransactResult>;
    };
  };
  tx: {
    Revive: {
      call: (params: ReviveCallParams) => Transaction;
    };
    Assets: {
      approve_transfer: (params: {
        id: number;
        delegate: { type: 'Address20'; value: `0x${string}` };
        amount: bigint;
      }) => Transaction;
    };
  };
  query: {
    Assets: {
      Account: {
        getValue: (
          assetId: number,
          account: string,
          options?: { at: string },
        ) => Promise<AssetAccountInfo | undefined>;
      };
    };
  };
  constants: {
    Revive: {
      NativeToEthRatio: () => Promise<bigint>;
    };
  };
}

interface EthTransactResult {
  success: boolean;
  value: {
    data: Binary;
    weight_required: { ref_time: bigint; proof_size: bigint };
    max_storage_deposit: bigint;
  };
}

interface ReviveCallParams {
  dest: FixedSizeBinary<20>;
  value: bigint;
  weight_limit: { ref_time: bigint; proof_size: bigint };
  storage_deposit_limit: bigint;
  data: Binary;
}

/** Parameter type for ReviveApi.eth_transact */
type EthTransactTx = {
  to: FixedSizeBinary<20>;
  value?: [bigint, bigint, bigint, bigint];
  input: { data: Binary };
  from?: FixedSizeBinary<20>;
  authorization_list: [];
  blob_versioned_hashes: [];
  blobs: [];
  gas_price: undefined;
  nonce: undefined;
  access_list: undefined;
  chain_id: undefined;
  gas: undefined;
  max_fee_per_blob_gas: undefined;
  max_fee_per_gas: undefined;
  max_priority_fee_per_gas: undefined;
  'r#type': undefined;
};

/**
 * Result of a successful write dry-run.
 */
export interface WriteResult<T = unknown> {
  response: T;
  send: () => Transaction;
}

/**
 * Convert a bigint to U256 (FixedSizeArray<4, bigint>: four u64 limbs, little-endian).
 */
function toU256(value: bigint): [bigint, bigint, bigint, bigint] {
  const mask = (1n << 64n) - 1n;
  return [
    value & mask,
    (value >> 64n) & mask,
    (value >> 128n) & mask,
    (value >> 192n) & mask,
  ];
}

/**
 * Derive the H160 EVM address from a 32-byte Substrate public key.
 *
 * Asset Hub pallet-revive uses these derivation rules:
 * - If the account was originally EVM-derived (last 12 bytes are all 0xEE):
 *   strip the padding to recover the original H160 address.
 * - If native Substrate account (sr25519/ed25519):
 *   keccak256(publicKey), take last 20 bytes. This is a one-way mapping.
 */
function deriveEvmAddress(publicKey: Uint8Array): `0x${string}` {
  if (publicKey.length !== 32) {
    throw new Error(
      `Expected 32-byte public key, got ${publicKey.length} bytes`,
    );
  }

  // Check if the last 12 bytes are all 0xEE (EVM-derived account)
  const isEvmDerived = publicKey.slice(20).every((b) => b === 0xee);

  if (isEvmDerived) {
    // Recover original H160 by stripping the 0xEE padding
    return toHex(publicKey.slice(0, 20));
  }

  // Native account: keccak256 hash of public key, last 20 bytes
  const hash = keccak256(publicKey);
  return `0x${hash.slice(-40)}` as `0x${string}`;
}

/**
 * Convert any address (SS58 or H160) to an EVM H160 address.
 *
 * Use this when passing addresses as Solidity function parameters.
 */
export function toEvmAddress(address: string): `0x${string}` {
  // Already H160 EVM format
  if (address.startsWith('0x') && address.length === 42) {
    return address as `0x${string}`;
  }

  // SS58 → decode to 32-byte public key → derive H160
  const publicKey = AccountId().enc(address);
  return deriveEvmAddress(publicKey);
}

/**
 * Build an EthTransactTx object for ReviveApi.eth_transact dry-runs.
 */
function buildEthTransactTx(opts: {
  to: `0x${string}`;
  callData: `0x${string}`;
  from?: string;
  value?: bigint;
}): EthTransactTx {
  const fromAddress = opts.from
    ? (Binary.fromHex(toEvmAddress(opts.from)) as FixedSizeBinary<20>)
    : undefined;

  return {
    to: Binary.fromHex(opts.to) as FixedSizeBinary<20>,
    value: opts.value ? toU256(opts.value) : undefined,
    input: { data: Binary.fromHex(opts.callData) },
    from: fromAddress,
    authorization_list: [],
    blob_versioned_hashes: [],
    blobs: [],
    gas_price: undefined,
    nonce: undefined,
    access_list: undefined,
    chain_id: undefined,
    gas: undefined,
    max_fee_per_blob_gas: undefined,
    max_fee_per_gas: undefined,
    max_priority_fee_per_gas: undefined,
    'r#type': undefined,
  };
}

/**
 * Serialize an error value for logging, handling Binary and nested objects.
 */
function serializeErrorValue(value: unknown): unknown {
  if (isBinaryLike(value)) {
    return value.asHex();
  }
  if (Array.isArray(value)) {
    return value.map(serializeErrorValue);
  }
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = serializeErrorValue(v);
    }
    return result;
  }
  return value;
}

type BinaryLike = {
  asHex: () => string;
};

function isBinaryLike(value: unknown): value is BinaryLike {
  return (
    !!value &&
    typeof value === 'object' &&
    'asHex' in value &&
    typeof value.asHex === 'function'
  );
}

/**
 * Extract a human-readable revert reason from a dry-run failure.
 *
 * The failure value from ReviveApi.eth_transact is an Enum with two variants:
 * - { type: "Message", value: string } — runtime-level error (balance, gas, etc.)
 * - { type: "Data", value: Binary } — contract revert data (Error(string) or custom error)
 */
function extractRevertReason(errValue: unknown, abi: Abi): string | undefined {
  try {
    if (!errValue || typeof errValue !== 'object') return undefined;
    const obj = errValue as { type?: string; value?: unknown };

    // Runtime message (e.g., "insufficient funds for gas * price + value")
    if (obj.type === 'Message' && typeof obj.value === 'string') {
      return obj.value;
    }

    // Contract revert data
    if (obj.type === 'Data' && isBinaryLike(obj.value)) {
      const errorData = obj.value.asHex() as `0x${string}`;
      if (errorData.length <= 2) return undefined;

      // Try ABI-defined custom errors first
      try {
        const decoded = decodeErrorResult({ abi, data: errorData });
        const args = decoded.args?.length ? `(${decoded.args.join(', ')})` : '';
        return `${decoded.errorName}${args}`;
      } catch {
        // Fallback: standard Error(string) from require() — selector 0x08c379a0
        if (errorData.startsWith('0x08c379a0')) {
          const abiData = `0x${errorData.slice(10)}` as `0x${string}`;
          const [message] = decodeAbiParameters(
            [{ name: 'message', type: 'string' }],
            abiData,
          );
          return message;
        }
      }
    }

    // If we couldn't extract a reason, return stringified structure for debugging
    return `Unknown error structure: ${JSON.stringify(serializeErrorValue(errValue))}`;
  } catch (e) {
    return `Error extraction failed: ${e instanceof Error ? e.message : String(e)}`;
  }
}

/**
 * Create an EVM contract caller for Revive-based chains.
 */
export function createEvmContract(
  typedApi: ReviveTypedApi,
  address: `0x${string}`,
  abi: Abi,
  getNativeToEvmRatio: () => bigint,
) {
  return {
    /** The contract's EVM address */
    address,

    /**
     * Call a view/pure function and return decoded result
     */
    async read<T = unknown>(
      functionName: string,
      args: unknown[] = [],
    ): Promise<T> {
      const callData = encodeFunctionData({
        abi,
        functionName,
        args,
      }) as `0x${string}`;
      const baseTx = buildEthTransactTx({ to: address, callData });

      const result = await typedApi.apis.ReviveApi.eth_transact(baseTx, {
        at: 'best',
      });

      if (!result.success) {
        const revertReason = extractRevertReason(result.value, abi);
        console.error(
          `[evmContract] ${functionName} call failed:`,
          revertReason,
        );
        throw new Error(
          revertReason
            ? `${functionName}: ${revertReason}`
            : `${functionName} call failed`,
        );
      }

      const dataHex = result.value.data.asHex();
      if (dataHex === '0x' || dataHex.length <= 2) {
        return undefined as T;
      }

      return decodeFunctionResult({ abi, functionName, data: dataHex }) as T;
    },

    /**
     * Dry-run a state-changing function, return send() for submission
     */
    async write<T = unknown>(
      functionName: string,
      args: unknown[],
      origin: string,
      value?: bigint,
    ): Promise<WriteResult<T>> {
      const callData = encodeFunctionData({
        abi,
        functionName,
        args,
      }) as `0x${string}`;

      // Debug: log addresses being used
      const derivedFrom = toEvmAddress(origin);
      console.log(`[evmContract] ${functionName} call:`, {
        contract: address,
        from: origin,
        derivedFrom,
        callDataPrefix: callData.slice(0, 10), // function selector
      });

      const baseTx = buildEthTransactTx({
        to: address,
        callData,
        from: origin,
        value,
      });

      const result = await typedApi.apis.ReviveApi.eth_transact(baseTx, {
        at: 'best',
      });

      if (!result.success) {
        // Debug: check the actual structure of the error value
        const errVal = result.value as { type?: string; value?: unknown };
        console.error(`[evmContract] ${functionName} dry-run error:`, {
          type: errVal?.type,
          valueType: errVal?.value?.constructor?.name,
          isBinary: errVal?.value instanceof Binary,
          // Try to get hex if it has asHex method
          hex:
            errVal?.value &&
            typeof (errVal.value as { asHex?: () => string }).asHex ===
              'function'
              ? (errVal.value as Binary).asHex()
              : 'no asHex method',
        });
        const revertReason = extractRevertReason(result.value, abi);
        console.error(
          `[evmContract] ${functionName} dry-run failed:`,
          revertReason,
        );
        throw new Error(
          revertReason
            ? `${functionName}: ${revertReason}`
            : `${functionName} dry-run failed`,
        );
      }

      const weightRequired = result.value.weight_required;
      const storageDeposit = result.value.max_storage_deposit;

      // Decode response from dry-run
      const dataHex = result.value.data.asHex();
      let decoded: T = undefined as T;
      if (dataHex !== '0x' && dataHex.length > 2) {
        decoded = decodeFunctionResult({
          abi,
          functionName,
          data: dataHex,
        }) as T;
      }

      return {
        response: decoded,
        send: () =>
          typedApi.tx.Revive.call({
            dest: Binary.fromHex(address) as FixedSizeBinary<20>,
            value: value ? value / getNativeToEvmRatio() : 0n,
            weight_limit: {
              ref_time: weightRequired.ref_time * 2n,
              proof_size: weightRequired.proof_size * 2n,
            },
            storage_deposit_limit: storageDeposit * 2n,
            data: Binary.fromHex(callData),
          }),
      };
    },
  };
}

export type EvmContract = ReturnType<typeof createEvmContract>;
