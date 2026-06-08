/**
 * Shared RPC utilities for deployment scripts (no Hardhat dependency).
 * Used by deploy-raw-rpc.ts, deploy-extensions-rpc.ts, and deploy-papi.ts.
 */
import fs from 'fs';
import path from 'path';

import type { InterfaceAbi } from 'ethers';

// Constants
export const DEFAULT_GAS_LIMIT = 50_000_000n;
export const RECEIPT_POLL_INTERVAL_MS = 2_000;
export const RECEIPT_MAX_ATTEMPTS = 60;

// Types
export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

export interface JsonRpcResponse<T> {
  result?: T;
  error?: JsonRpcError;
}

export interface TransactionReceipt {
  contractAddress?: string;
  status?: string;
}

export interface DeploymentReceipt {
  contractAddress: string;
  status: string;
}

export interface ContractArtifact {
  abi: InterfaceAbi;
  bytecode: string;
}

export interface DeploymentRecord {
  network: string;
  chainId: string;
  [key: string]: string | undefined;
}

/**
 * Make a JSON-RPC call to an Ethereum-compatible endpoint.
 */
export async function rpcCall<T>(
  rpcUrl: string,
  method: string,
  params: unknown[],
): Promise<T> {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `RPC HTTP error ${response.status}: ${response.statusText}`,
    );
  }

  const json = (await response.json()) as JsonRpcResponse<T>;
  if (json.error) {
    throw new Error(`RPC error: ${JSON.stringify(json.error)}`);
  }
  if (json.result === undefined) {
    throw new Error(`RPC response missing result for ${method}`);
  }
  return json.result;
}

/**
 * Wait for a contract deployment receipt.
 * Throws if not found, transaction failed, or contractAddress is missing.
 */
export async function waitForDeploymentReceipt(
  rpcUrl: string,
  txHash: string,
): Promise<DeploymentReceipt> {
  for (let i = 0; i < RECEIPT_MAX_ATTEMPTS; i++) {
    const receipt = await rpcCall<TransactionReceipt | null>(
      rpcUrl,
      'eth_getTransactionReceipt',
      [txHash],
    );

    if (receipt) {
      if (receipt.status !== '0x1') {
        throw new Error(`Transaction failed: ${JSON.stringify(receipt)}`);
      }
      if (!receipt.contractAddress) {
        throw new Error(
          `Contract address missing in receipt: ${JSON.stringify(receipt)}`,
        );
      }
      return {
        contractAddress: receipt.contractAddress,
        status: receipt.status,
      };
    }

    await new Promise((r) => setTimeout(r, RECEIPT_POLL_INTERVAL_MS));
    process.stdout.write('.');
  }

  throw new Error(
    `Receipt not found after ${(RECEIPT_MAX_ATTEMPTS * RECEIPT_POLL_INTERVAL_MS) / 1000} seconds. ` +
      `Check the transaction manually: ${txHash}`,
  );
}

/**
 * Load a contract artifact from the artifacts directory.
 * Validates that bytecode and abi exist.
 */
export function loadArtifact(contractName: string): ContractArtifact {
  const artifactPath = path.join(
    __dirname,
    `../artifacts/contracts/${contractName}.sol/${contractName}.json`,
  );

  if (!fs.existsSync(artifactPath)) {
    throw new Error(
      `Artifact not found: ${artifactPath}. Run 'npx hardhat compile' first.`,
    );
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8')) as {
    abi?: InterfaceAbi;
    bytecode?: string;
  };

  if (!artifact.abi || !Array.isArray(artifact.abi)) {
    throw new Error(`Invalid ABI in artifact: ${artifactPath}`);
  }

  if (!artifact.bytecode || typeof artifact.bytecode !== 'string') {
    throw new Error(`Invalid bytecode in artifact: ${artifactPath}`);
  }

  return { abi: artifact.abi, bytecode: artifact.bytecode };
}

/**
 * Get the path to a deployment file.
 */
function getDeploymentPath(network: string, chainId: number): string {
  return path.join(
    __dirname,
    '..',
    'deployments',
    `${network}-${chainId}.json`,
  );
}

/**
 * Load a deployment record from the deployments directory.
 * Validates that required fields exist.
 */
export function loadDeployment(
  network: string,
  chainId: number,
): DeploymentRecord {
  const deploymentPath = getDeploymentPath(network, chainId);

  if (!fs.existsSync(deploymentPath)) {
    throw new Error(
      `Deployment not found at ${deploymentPath}. Run deploy-raw-rpc.ts first.`,
    );
  }

  const deployment = JSON.parse(
    fs.readFileSync(deploymentPath, 'utf8'),
  ) as DeploymentRecord;

  if (!deployment.network || !deployment.chainId) {
    throw new Error(
      `Invalid deployment file: missing network or chainId in ${deploymentPath}`,
    );
  }

  return deployment;
}

/**
 * Save a deployment record to the deployments directory.
 */
export function saveDeployment(
  network: string,
  chainId: number,
  data: DeploymentRecord,
): string {
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentPath = getDeploymentPath(network, chainId);
  fs.writeFileSync(deploymentPath, JSON.stringify(data, null, 2));
  return deploymentPath;
}

/**
 * Convert a WebSocket endpoint to an HTTP endpoint.
 * wss:// -> https://, ws:// -> http://
 */
export function wsToHttpEndpoint(wsEndpoint: string): string {
  return wsEndpoint.replace(/^ws(s?):\/\//, 'http$1://');
}
