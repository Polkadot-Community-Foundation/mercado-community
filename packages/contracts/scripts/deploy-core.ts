import fs from 'fs';
import path from 'path';

import { ethers } from 'hardhat';

import {
  getDeploymentsFilePath,
  getEnvFileForNetwork,
  getWsEndpoint,
  withRetry,
} from './util';

// pUSD configuration on Asset Hub (Trust-Backed Asset)
const PUSD_CONFIG = {
  assetId: 50000413,
  decimals: 6,
  symbol: 'pUSD',
};

/** Maximum valid asset ID (uint32 max) */
const MAX_ASSET_ID = 0xffffffff;

/**
 * Convert an Asset Hub asset ID to its ERC20 precompile address.
 *
 * The precompile address format for Asset Hub assets:
 * - First 4 bytes: asset ID (left-padded to 8 hex chars)
 * - Next 12 bytes: zeros
 * - Last 4 bytes: 0x01200000 (precompile identifier)
 */
function assetIdToErc20(assetId: number): string {
  if (!Number.isFinite(assetId) || !Number.isInteger(assetId)) {
    throw new Error(`Invalid asset ID: ${assetId} (must be an integer)`);
  }
  if (assetId < 0 || assetId > MAX_ASSET_ID) {
    throw new Error(
      `Asset ID out of range: ${assetId} (must be 0 to ${MAX_ASSET_ID})`,
    );
  }

  const assetIdHex = assetId.toString(16).padStart(8, '0');
  const zeros = '000000000000000000000000';
  const precompileId = '01200000';
  return `0x${assetIdHex}${zeros}${precompileId}`;
}

async function fetchGenesisHash(networkName: string): Promise<string | null> {
  const wsUrl = getWsEndpoint(networkName);
  const httpUrl = wsUrl.replace(/^ws(s?):\/\//, 'http$1://');
  try {
    const res = await fetch(httpUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'chain_getBlockHash',
        params: [0],
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { result?: string };
    return json.result ?? null;
  } catch {
    return null;
  }
}

function upsertEnvVar(content: string, key: string, value: string): string {
  const pattern = new RegExp(`^#?${key}=.*`, 'm');
  if (pattern.test(content)) return content.replace(pattern, `${key}=${value}`);
  return content + `\n${key}=${value}\n`;
}

async function updateEnvFile(
  mercadoAddress: string,
  mockMobRuleAddress: string,
  networkName: string,
) {
  const envFileName = getEnvFileForNetwork(networkName);
  const envPath = path.resolve(__dirname, `../../../apps/web/${envFileName}`);
  const genesisHash = await fetchGenesisHash(networkName);

  let content = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, 'utf8')
    : '# Auto-created\n';
  content = upsertEnvVar(content, 'VITE_MERCADO_ADDRESS', mercadoAddress);
  content = upsertEnvVar(
    content,
    'VITE_MOCKMOBRULE_ADDRESS',
    mockMobRuleAddress,
  );
  if (genesisHash)
    content = upsertEnvVar(content, 'VITE_GENESIS_HASH', genesisHash);

  // Sync pUSD configuration to ensure frontend and contract use same asset
  content = upsertEnvVar(
    content,
    'VITE_PUSD_ASSET_ID',
    PUSD_CONFIG.assetId.toString(),
  );
  content = upsertEnvVar(
    content,
    'VITE_PUSD_DECIMALS',
    PUSD_CONFIG.decimals.toString(),
  );
  content = upsertEnvVar(content, 'VITE_PUSD_SYMBOL', PUSD_CONFIG.symbol);

  fs.writeFileSync(envPath, content);
  console.log(`📝 Updated ${envFileName}`);
}

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying MercadoCore with account:', deployer.address);
  console.log(
    'Account balance:',
    (await ethers.provider.getBalance(deployer.address)).toString(),
  );

  // Deploy MercadoCore
  console.log('\nDeploying MercadoCore...');
  const MercadoCore = await ethers.getContractFactory('MercadoCore');
  const mercado = await withRetry('MercadoCore', async () => {
    const contract = await MercadoCore.deploy(deployer.address);
    await contract.waitForDeployment();
    return contract;
  });
  const mercadoAddress = await mercado.getAddress();
  console.log('MercadoCore deployed at:', mercadoAddress);

  // Deploy MockMobRule
  console.log('\nDeploying MockMobRule...');
  const MockMobRule = await ethers.getContractFactory('MockMobRule');
  const mockMobRule = await withRetry('MockMobRule', async () => {
    const contract = await MockMobRule.deploy(deployer.address, mercadoAddress);
    await contract.waitForDeployment();
    return contract;
  });
  const mockMobRuleAddress = await mockMobRule.getAddress();
  console.log('MockMobRule deployed at:', mockMobRuleAddress);

  console.log('\n✅ Deployment successful!');
  console.log('==========================================');
  console.log('MercadoCore:', mercadoAddress);
  console.log('MockMobRule:', mockMobRuleAddress);
  console.log('Owner:', deployer.address);
  console.log('==========================================\n');

  // Save deployment
  const deployment = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    mercadoCore: mercadoAddress,
    mockMobRule: mockMobRuleAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  const filepath = await getDeploymentsFilePath();
  fs.writeFileSync(filepath, JSON.stringify(deployment, null, 2));
  console.log(`Deployment saved to: ${filepath}`);

  const networkName = (await ethers.provider.getNetwork()).name || 'unknown';
  await updateEnvFile(mercadoAddress, mockMobRuleAddress, networkName);

  // Add pUSD as allowed payment asset
  const pusdAddress = assetIdToErc20(PUSD_CONFIG.assetId);
  console.log('\nAdding pUSD as allowed payment asset...');
  console.log('pUSD ERC20 address:', pusdAddress);
  await withRetry('addPaymentAsset', async () => {
    const tx = await mercado.addPaymentAsset(pusdAddress);
    await tx.wait();
  });
  console.log('✅ pUSD payment asset added');

  // Verify
  console.log('\nVersion:', await mercado.VERSION());
  console.log('Owner:', await mercado.owner());
  console.log('pUSD allowed:', await mercado.allowedAssets(pusdAddress));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
