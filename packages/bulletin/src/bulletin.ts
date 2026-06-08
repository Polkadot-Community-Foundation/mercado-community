import { bulletin } from '@polkadot-api/descriptors';
import { sr25519CreateDerive } from '@polkadot-labs/hdkd';
import {
  entropyToMiniSecret,
  mnemonicToEntropy,
} from '@polkadot-labs/hdkd-helpers';
import { AccountId, Binary, createClient, Enum } from 'polkadot-api';
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';
import { getPolkadotSigner } from 'polkadot-api/signer';
import { getWsProvider } from 'polkadot-api/ws-provider';

import { calculateCID } from './cid.js';

export interface UploadOptions {
  /**
   * Full mnemonic phrase for signing transactions.
   * Required for actual uploads. If not provided, uploadToBulletin will throw an error.
   */
  mnemonic?: string;
  /** Optional derivation path (defaults to empty string for root key) */
  derivationPath?: string;
  bulletinEndpoint?: string;
}

export interface UploadResult {
  cid: string;
  blockHash: string;
}

/**
 * Create a signer and SS58 address from a mnemonic
 */
function createSigner(mnemonic: string, derivationPath: string = '') {
  const entropy = mnemonicToEntropy(mnemonic);
  const miniSecret = entropyToMiniSecret(entropy);
  const derive = sr25519CreateDerive(miniSecret);
  const keypair = derive(derivationPath);
  const address = AccountId().dec(keypair.publicKey);

  return {
    signer: getPolkadotSigner(keypair.publicKey, 'Sr25519', keypair.sign),
    address,
  };
}

/**
 * Check transaction result for errors and extract block hash
 */
function checkTransactionResult(result: unknown): { blockHash: string } {
  const resultWithError = result as {
    dispatchError?: unknown;
    block: { hash: string };
  };
  if (
    resultWithError.dispatchError !== undefined &&
    resultWithError.dispatchError !== null
  ) {
    const errorDetails =
      typeof resultWithError.dispatchError === 'object'
        ? JSON.stringify(resultWithError.dispatchError)
        : String(resultWithError.dispatchError);
    throw new Error(`Transaction dispatch error: ${errorDetails}`);
  }
  return { blockHash: resultWithError.block.hash };
}

/**
 * Upload file bytes to Bulletin Chain
 * @param fileBytes - The file content as Uint8Array
 * @param options - Upload options including mnemonic (required)
 * @returns Upload result with CID, block hash, and gateway URL
 */
export async function uploadToBulletin(
  fileBytes: Uint8Array,
  options: UploadOptions,
): Promise<UploadResult> {
  const { mnemonic, derivationPath = '' } = options;

  if (!mnemonic) {
    throw new Error(
      'mnemonic is required for Bulletin uploads. Provide a mnemonic phrase in UploadOptions.',
    );
  }
  if (!options.bulletinEndpoint) {
    throw new Error(
      'bulletinEndpoint is required. Please set environment variable.',
    );
  }

  console.log('Calculating CID...');
  const cid = calculateCID(fileBytes);

  console.log('Connecting to Bulletin...');

  const wsProvider = getWsProvider(options.bulletinEndpoint);
  const client = createClient(withPolkadotSdkCompat(wsProvider));

  try {
    const api = client.getTypedApi(bulletin);
    const { signer, address } = createSigner(mnemonic, derivationPath);

    // Ensure the account is authorized for bulletin storage
    const authKey = Enum('Account', address);
    const auth =
      await api.query.TransactionStorage.Authorizations.getValue(authKey);

    if (
      !auth ||
      auth.extent.transactions < 1 ||
      auth.extent.bytes < BigInt(fileBytes.length)
    ) {
      console.log('Authorizing account for bulletin storage...');
      const authTx = api.tx.TransactionStorage.authorize_account({
        who: address,
        transactions: 100,
        bytes: BigInt(100 * 1024 * 1024), // 100 MiB
      });
      const authResult = await authTx.signAndSubmit(signer);
      checkTransactionResult(authResult);
    }

    console.log('Submitting to blockchain...');
    const storeCall = api.tx.TransactionStorage.store({
      data: Binary.fromBytes(fileBytes),
    });
    const result = await storeCall.signAndSubmit(signer);
    const { blockHash } = checkTransactionResult(result);

    console.log('Transaction included in block');

    return {
      cid,
      blockHash,
    };
  } finally {
    try {
      client.destroy();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to destroy client:', err);
      }
    }
  }
}

export interface BatchUploadItem {
  fileBytes: Uint8Array;
  label: string;
}

export interface BatchUploadResult {
  label: string;
  cid: string;
  success: boolean;
  blockHash: string;
  error?: string;
}

/**
 * Upload multiple files to Bulletin Chain reusing a single WebSocket connection.
 * Files are submitted sequentially (Bulletin requires sequential tx submission).
 */
export async function batchUploadToBulletin(
  files: BatchUploadItem[],
  options: UploadOptions & {
    onProgress?: (
      completed: number,
      total: number,
      current: BatchUploadResult,
    ) => void;
  },
): Promise<BatchUploadResult[]> {
  const { mnemonic, derivationPath = '' } = options;

  if (!mnemonic) {
    throw new Error(
      'mnemonic is required for Bulletin uploads. Provide a mnemonic phrase in UploadOptions.',
    );
  }
  if (!options.bulletinEndpoint) {
    throw new Error(
      'bulletinEndpoint is required. Please set environment variable.',
    );
  }

  if (files.length === 0) return [];

  const wsProvider = getWsProvider(options.bulletinEndpoint);
  const client = createClient(withPolkadotSdkCompat(wsProvider));
  const results: BatchUploadResult[] = [];

  try {
    const api = client.getTypedApi(bulletin);
    const { signer, address } = createSigner(mnemonic, derivationPath);

    // Ensure the account is authorized for bulletin storage (once for the batch)
    const totalBytes = files.reduce((sum, f) => sum + f.fileBytes.length, 0);
    const authKey = Enum('Account', address);
    const auth =
      await api.query.TransactionStorage.Authorizations.getValue(authKey);

    if (
      !auth ||
      auth.extent.transactions < files.length ||
      auth.extent.bytes < BigInt(totalBytes)
    ) {
      console.log('Authorizing account for bulletin storage...');
      const authTx = api.tx.TransactionStorage.authorize_account({
        who: address,
        transactions: Math.max(100, files.length),
        bytes: BigInt(Math.max(100 * 1024 * 1024, totalBytes * 2)),
      });
      const authResult = await authTx.signAndSubmit(signer);
      checkTransactionResult(authResult);
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i]!;
      const cid = calculateCID(file.fileBytes);

      try {
        const storeCall = api.tx.TransactionStorage.store({
          data: Binary.fromBytes(file.fileBytes),
        });

        const result = await storeCall.signAndSubmit(signer);
        const { blockHash } = checkTransactionResult(result);

        const uploadResult: BatchUploadResult = {
          label: file.label,
          cid,
          success: true,
          blockHash,
        };
        results.push(uploadResult);
        options.onProgress?.(i + 1, files.length, uploadResult);
      } catch (err) {
        const uploadResult: BatchUploadResult = {
          label: file.label,
          cid,
          success: false,
          blockHash: '',
          error: err instanceof Error ? err.message : String(err),
        };
        results.push(uploadResult);
        options.onProgress?.(i + 1, files.length, uploadResult);
      }
    }
  } finally {
    try {
      client.destroy();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to destroy client:', err);
      }
    }
  }

  return results;
}
