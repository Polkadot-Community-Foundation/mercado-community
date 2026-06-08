import { ethers } from 'hardhat';

import { withRetry } from './util';

/**
 * Simple deployment without UUPS proxy - for testing size limits
 */
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying contracts with account:', deployer.address);
  console.log(
    'Account balance:',
    (await ethers.provider.getBalance(deployer.address)).toString(),
  );

  // Deploy MockMobRule first (smaller contract)
  console.log('\nDeploying MockMobRule...');
  const MockMobRule = await ethers.getContractFactory('MockMobRule');

  // Use a placeholder address for now
  const mockMobRule = await withRetry('MockMobRule', async () => {
    const contract = await MockMobRule.deploy(
      deployer.address,
      deployer.address,
    );
    await contract.waitForDeployment();
    return contract;
  });

  const mockMobRuleAddress = await mockMobRule.getAddress();
  console.log('MockMobRule deployed at:', mockMobRuleAddress);

  console.log('\n✅ MockMobRule deployment successful!');
  console.log('==========================================');
  console.log('MockMobRule:', mockMobRuleAddress);
  console.log('Owner (deployer):', deployer.address);
  console.log('==========================================\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
