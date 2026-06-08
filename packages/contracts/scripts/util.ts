import path from 'path';
import fs from 'fs';

import { ethers } from 'hardhat';

// Re-export standalone utilities (no Hardhat dependency)
export {
  getEnvFileForNetwork,
  getTokenInfoForNetwork,
  getWsEndpoint,
  withRetry,
} from './network';

export async function getDeploymentsFilePath(): Promise<string> {
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const networkName = (await ethers.provider.getNetwork()).name || 'unknown';
  const chainId = (await ethers.provider.getNetwork()).chainId.toString();
  const filename = `${networkName}-${chainId}.json`;

  return path.join(deploymentsDir, filename);
}

/**
 * Get chain-specific token decimals and name based on chain ID.
 * Used by deploy.ts which runs under Hardhat.
 */
export async function getChainTokenInfo(): Promise<{
  decimals: number;
  tokenName: string;
}> {
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);

  if (chainId === 31337) {
    // Local Hardhat
    return { decimals: 18, tokenName: 'LOC' };
  } else if (chainId === 420420417) {
    // Paseo Asset Hub
    return { decimals: 10, tokenName: 'PAS' };
  } else if (chainId === 420420421) {
    // Westend Asset Hub
    return { decimals: 12, tokenName: 'WND' };
  } else {
    throw new Error(
      `Unsupported chain ID ${chainId}. Supported chains: 31337 (local), 420420417 (Paseo), 420420421 (Westend)`,
    );
  }
}
