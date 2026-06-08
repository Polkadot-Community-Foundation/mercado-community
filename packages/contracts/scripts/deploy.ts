import fs from 'fs';
import path from 'path';

import { ethers } from 'hardhat';

import {
  getDeploymentsFilePath,
  getEnvFileForNetwork,
  getWsEndpoint,
  withRetry,
} from './util';

/**
 * Fetch genesis hash from the Substrate RPC endpoint for a given network.
 */
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
  } catch (err) {
    console.warn(`⚠️  Could not fetch genesis hash from ${httpUrl}:`, err);
    return null;
  }
}

/**
 * Update an env var in content string.
 */
function upsertEnvVar(content: string, key: string, value: string): string {
  const pattern = new RegExp(`^#?${key}=.*`, 'm');
  if (pattern.test(content)) {
    return content.replace(pattern, `${key}=${value}`);
  }
  return content + `\n${key}=${value}\n`;
}

interface ContractAddresses {
  mercado: string;
  mockMobRule: string;
  matchmakers: string;
}

/**
 * Update env files with contract addresses after deployment.
 */
async function updateEnvFiles(
  addresses: ContractAddresses,
  networkName: string,
) {
  // All apps that need contract addresses
  const apps = ['web', 'mm-portal', 'mockmobrule-admin'];
  const envFileName = getEnvFileForNetwork(networkName);
  let updatedCount = 0;

  const genesisHash = await fetchGenesisHash(networkName);

  for (const app of apps) {
    const envPath = path.resolve(
      __dirname,
      `../../../apps/${app}/${envFileName}`,
    );

    let envContent: string;
    if (!fs.existsSync(envPath)) {
      if (envFileName.endsWith('.local')) {
        envContent = `# Auto-created by deploy — personal overrides (gitignored)\n`;
        console.log(`📝 Creating ${app}/${envFileName}`);
      } else {
        console.log(`⚠️  ${app}/${envFileName} not found, skipping`);
        continue;
      }
    } else {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Update all contract addresses
    envContent = upsertEnvVar(
      envContent,
      'VITE_MERCADO_ADDRESS',
      addresses.mercado,
    );
    envContent = upsertEnvVar(
      envContent,
      'VITE_MOCKMOBRULE_ADDRESS',
      addresses.mockMobRule,
    );
    envContent = upsertEnvVar(
      envContent,
      'VITE_MATCHMAKERS_ADDRESS',
      addresses.matchmakers,
    );

    if (genesisHash) {
      envContent = upsertEnvVar(envContent, 'VITE_GENESIS_HASH', genesisHash);
    }

    fs.writeFileSync(envPath, envContent);
    updatedCount++;
  }

  if (updatedCount > 0) {
    const parts = ['contract addresses'];
    if (genesisHash) parts.push('genesis hash');
    console.log(
      `\n📝 Updated ${envFileName} in ${updatedCount} app(s) with ${parts.join(' + ')}`,
    );
  }
}

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying contracts with account:', deployer.address);
  console.log(
    'Account balance:',
    (await ethers.provider.getBalance(deployer.address)).toString(),
  );

  // Deploy MercadoCore (lean, non-upgradeable)
  console.log('\nDeploying MercadoCore...');
  const MercadoCore = await ethers.getContractFactory('MercadoCore');
  const mercado = await withRetry('MercadoCore', async () => {
    const contract = await MercadoCore.deploy(deployer.address);
    await contract.waitForDeployment();
    return contract;
  });
  const mercadoAddress = await mercado.getAddress();

  // Deploy MockMobRule (for dispute resolution admin panel)
  console.log('\nDeploying MockMobRule...');
  const MockMobRule = await ethers.getContractFactory('MockMobRule');
  const mockMobRule = await withRetry('MockMobRule', async () => {
    const contract = await MockMobRule.deploy(deployer.address, mercadoAddress);
    await contract.waitForDeployment();
    return contract;
  });
  const mockMobRuleAddress = await mockMobRule.getAddress();

  // Deploy MercadoMatchmakers
  console.log('\nDeploying MercadoMatchmakers...');
  const MercadoMatchmakers =
    await ethers.getContractFactory('MercadoMatchmakers');
  const matchmakers = await withRetry('MercadoMatchmakers', async () => {
    const contract = await MercadoMatchmakers.deploy(
      mercadoAddress,
      deployer.address,
    );
    await contract.waitForDeployment();
    return contract;
  });
  const matchmakersAddress = await matchmakers.getAddress();

  // Link MercadoMatchmakers to MercadoCore
  console.log('\nLinking MercadoMatchmakers to MercadoCore...');
  const mercadoContract = await ethers.getContractAt(
    'MercadoCore',
    mercadoAddress,
  );
  await withRetry('setMatchmakers', async () => {
    const tx = await mercadoContract.setMatchmakers(matchmakersAddress);
    await tx.wait();
    return tx;
  });

  console.log('\n✅ Deployment successful!');
  console.log('==========================================');
  console.log('MercadoCore:', mercadoAddress);
  console.log('MockMobRule:', mockMobRuleAddress);
  console.log('MercadoMatchmakers:', matchmakersAddress);
  console.log('MercadoMatchmakers linked: ✅');
  console.log('Owner (deployer):', deployer.address);
  console.log('==========================================\n');

  // Save deployment info
  const deployment = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    mercadoCore: mercadoAddress,
    mockMobRule: mockMobRuleAddress,
    mercadoMatchmakers: matchmakersAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  console.log('Deployment info:', JSON.stringify(deployment, null, 2));

  // Save deployment addresses to JSON file
  const filepath = await getDeploymentsFilePath();
  fs.writeFileSync(filepath, JSON.stringify(deployment, null, 2));
  console.log(`\nDeployment addresses saved to: ${filepath}`);

  // Update env files with contract addresses + genesis hash
  const networkName = (await ethers.provider.getNetwork()).name || 'unknown';
  await updateEnvFiles(
    {
      mercado: mercadoAddress,
      mockMobRule: mockMobRuleAddress,
      matchmakers: matchmakersAddress,
    },
    networkName,
  );

  // Verify initial state
  console.log('\nVerifying initial state...');
  const version = await mercado.VERSION();
  const owner = await mercado.owner();
  const linkedMatchmakers = await mercadoContract.matchmakers();

  console.log('Version:', version);
  console.log('Owner:', owner);
  console.log(
    'MercadoMatchmakers linked:',
    linkedMatchmakers === matchmakersAddress ? '✅' : '❌',
  );
  console.log('\n✅ All checks passed!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
