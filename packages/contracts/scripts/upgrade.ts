import fs from 'fs';

import { ethers, upgrades } from 'hardhat';

import { getDeploymentsFilePath, withRetry } from './util';

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Upgrading contracts with account:', deployer.address);

  // Load deployment info
  const filepath = await getDeploymentsFilePath();
  if (!fs.existsSync(filepath)) {
    throw new Error(`Deployment file not found: ${filepath}`);
  }

  const deployment = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  const proxyAddress = deployment.mercado.proxy;

  console.log(`\nUpgrading Mercado at proxy: ${proxyAddress}`);

  // Deploy new implementation
  const Mercado = await ethers.getContractFactory('Mercado');

  const upgraded = await withRetry('Mercado upgrade', () =>
    upgrades.upgradeProxy(proxyAddress, Mercado, {
      kind: 'uups',
    }),
  );

  await upgraded.waitForDeployment();

  const newImplementation =
    await upgrades.erc1967.getImplementationAddress(proxyAddress);

  console.log('\n✅ Upgrade successful!');
  console.log('==========================================');
  console.log('Proxy address:', proxyAddress);
  console.log('Old implementation:', deployment.mercado.implementation);
  console.log('New implementation:', newImplementation);
  console.log('==========================================\n');

  // Update deployment file
  deployment.mercado.implementation = newImplementation;
  deployment.upgradedAt = new Date().toISOString();

  fs.writeFileSync(filepath, JSON.stringify(deployment, null, 2));
  console.log(`Deployment file updated: ${filepath}`);

  // Verify new version
  const mercado = await ethers.getContractAt('Mercado', proxyAddress);
  const version = await mercado.VERSION();
  console.log(`\nContract version: ${version}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
