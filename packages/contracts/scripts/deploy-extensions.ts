import fs from 'fs';
import path from 'path';

import { ethers } from 'hardhat';

import { getDeploymentsFilePath, withRetry } from './util';

/**
 * Update environment files with contract addresses.
 * Pattern follows mark3t's deployment approach.
 */
function updateEnvFiles(
  addresses: Record<string, string>,
  genesisHash: string,
) {
  const appsDir = path.resolve(__dirname, '../../../apps');

  // Apps that need contract addresses
  const apps = ['web', 'mockmobrule-admin', 'mm-portal'];

  for (const app of apps) {
    const envPath = path.join(appsDir, app, '.env.paseo-local');

    let content = '';
    if (fs.existsSync(envPath)) {
      content = fs.readFileSync(envPath, 'utf8');
    }

    // Update or add each address
    for (const [key, value] of Object.entries(addresses)) {
      const envKey = `VITE_${key}`;
      const regex = new RegExp(`^${envKey}=.*$`, 'm');

      if (regex.test(content)) {
        content = content.replace(regex, `${envKey}=${value}`);
      } else {
        content += `\n${envKey}=${value}`;
      }
    }

    // Add genesis hash if not present
    const genesisKey = 'VITE_GENESIS_HASH';
    if (!content.includes(genesisKey)) {
      content += `\n${genesisKey}=${genesisHash}`;
    }

    fs.writeFileSync(envPath, content.trim() + '\n');
    console.log(`Updated: ${envPath}`);
  }
}

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying extension contracts with account:', deployer.address);
  console.log(
    'Account balance:',
    (await ethers.provider.getBalance(deployer.address)).toString(),
  );

  // Load existing deployment to get MercadoCore address
  const deploymentsPath = await getDeploymentsFilePath();
  if (!fs.existsSync(deploymentsPath)) {
    throw new Error(
      `Deployment file not found at ${deploymentsPath}. Deploy MercadoCore first.`,
    );
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));
  const mercadoCoreAddress = deployment.mercadoCore;
  console.log('\nUsing MercadoCore at:', mercadoCoreAddress);

  // Deploy MercadoRatings
  console.log('\nDeploying MercadoRatings...');
  const MercadoRatings = await ethers.getContractFactory('MercadoRatings');
  const ratings = await withRetry('MercadoRatings', async () => {
    const contract = await MercadoRatings.deploy(
      mercadoCoreAddress,
      deployer.address,
    );
    await contract.waitForDeployment();
    return contract;
  });
  const ratingsAddress = await ratings.getAddress();
  console.log('MercadoRatings deployed at:', ratingsAddress);

  // Deploy RestaurantMeta
  console.log('\nDeploying RestaurantMeta...');
  const RestaurantMeta = await ethers.getContractFactory('RestaurantMeta');
  const meta = await withRetry('RestaurantMeta', async () => {
    const contract = await RestaurantMeta.deploy(mercadoCoreAddress);
    await contract.waitForDeployment();
    return contract;
  });
  const metaAddress = await meta.getAddress();
  console.log('RestaurantMeta deployed at:', metaAddress);

  // Deploy MercadoDisputes
  console.log('\nDeploying MercadoDisputes...');
  const MercadoDisputes = await ethers.getContractFactory('MercadoDisputes');
  const disputes = await withRetry('MercadoDisputes', async () => {
    const contract = await MercadoDisputes.deploy(
      mercadoCoreAddress,
      deployer.address,
    );
    await contract.waitForDeployment();
    return contract;
  });
  const disputesAddress = await disputes.getAddress();
  console.log('MercadoDisputes deployed at:', disputesAddress);

  // Deploy MockMobRule (admin-resolved dispute system, like mark3t)
  console.log('\nDeploying MockMobRule...');
  const MockMobRule = await ethers.getContractFactory('MockMobRule');
  const mockMobRule = await withRetry('MockMobRule', async () => {
    const contract = await MockMobRule.deploy(
      deployer.address,
      mercadoCoreAddress,
    );
    await contract.waitForDeployment();
    return contract;
  });
  const mockMobRuleAddress = await mockMobRule.getAddress();
  console.log('MockMobRule deployed at:', mockMobRuleAddress);

  // Deploy MercadoMatchmakers
  console.log('\nDeploying MercadoMatchmakers...');
  const MercadoMatchmakers =
    await ethers.getContractFactory('MercadoMatchmakers');
  const matchmakers = await withRetry('MercadoMatchmakers', async () => {
    const contract = await MercadoMatchmakers.deploy(
      mercadoCoreAddress,
      deployer.address,
    );
    await contract.waitForDeployment();
    return contract;
  });
  const matchmakersAddress = await matchmakers.getAddress();
  console.log('MercadoMatchmakers deployed at:', matchmakersAddress);

  console.log('\n✅ Extension deployment successful!');
  console.log('==========================================');
  console.log('MercadoRatings:', ratingsAddress);
  console.log('RestaurantMeta:', metaAddress);
  console.log('MercadoDisputes:', disputesAddress);
  console.log('MockMobRule:', mockMobRuleAddress);
  console.log('MercadoMatchmakers:', matchmakersAddress);
  console.log('==========================================\n');

  // Update deployment file
  deployment.mercadoRatings = ratingsAddress;
  deployment.restaurantMeta = metaAddress;
  deployment.mercadoDisputes = disputesAddress;
  deployment.mockMobRule = mockMobRuleAddress;
  deployment.mercadoMatchmakers = matchmakersAddress;
  deployment.extensionsTimestamp = new Date().toISOString();

  fs.writeFileSync(deploymentsPath, JSON.stringify(deployment, null, 2));
  console.log(`Deployment updated: ${deploymentsPath}`);

  // Get genesis hash
  const genesisBlock = await ethers.provider.getBlock(0);
  const genesisHash = genesisBlock?.hash || '';

  // Update app .env files with all contract addresses
  updateEnvFiles(
    {
      MERCADO_ADDRESS: mercadoCoreAddress,
      MERCADO_RATINGS_ADDRESS: ratingsAddress,
      RESTAURANT_META_ADDRESS: metaAddress,
      MERCADO_DISPUTES_ADDRESS: disputesAddress,
      MOCKMOBRULE_ADDRESS: mockMobRuleAddress,
      MATCHMAKERS_ADDRESS: matchmakersAddress,
    },
    genesisHash,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
