import fs from 'fs';
import path from 'path';

import { ethers } from 'hardhat';

import {
  getDeploymentsFilePath,
  getEnvFileForNetwork,
  getWsEndpoint,
  withRetry,
} from './util';

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

  fs.writeFileSync(envPath, content);
  console.log(`📝 Updated ${envFileName}`);
}

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying MercadoLite with account:', deployer.address);
  console.log(
    'Account balance:',
    (await ethers.provider.getBalance(deployer.address)).toString(),
  );

  // Deploy MercadoLite
  console.log('\nDeploying MercadoLite...');
  const MercadoLite = await ethers.getContractFactory('MercadoLite');
  const mercado = await withRetry('MercadoLite', async () => {
    const contract = await MercadoLite.deploy(deployer.address);
    await contract.waitForDeployment();
    return contract;
  });
  const mercadoAddress = await mercado.getAddress();
  console.log('MercadoLite deployed at:', mercadoAddress);

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
  console.log('MercadoLite:', mercadoAddress);
  console.log('MockMobRule:', mockMobRuleAddress);
  console.log('Owner:', deployer.address);
  console.log('==========================================\n');

  // Save deployment
  const deployment = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    mercadoLite: mercadoAddress,
    mockMobRule: mockMobRuleAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  const filepath = await getDeploymentsFilePath();
  fs.writeFileSync(filepath, JSON.stringify(deployment, null, 2));
  console.log(`Deployment saved to: ${filepath}`);

  const networkName = (await ethers.provider.getNetwork()).name || 'unknown';
  await updateEnvFile(mercadoAddress, mockMobRuleAddress, networkName);

  // Verify
  console.log('\nVersion:', await mercado.VERSION());
  console.log('Owner:', await mercado.owner());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
