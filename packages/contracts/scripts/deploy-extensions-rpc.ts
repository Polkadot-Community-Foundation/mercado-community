/**
 * Deploy extension contracts using raw JSON-RPC calls.
 *
 * This script bypasses hardhat-polkadot's micro-eth-signer which enforces
 * EIP-3860 initcode size limits that don't apply to PVM contracts.
 *
 * Usage:
 *   PRIVATE_KEY=0x... npx tsx scripts/deploy-extensions-rpc.ts
 */
import fs from 'fs';
import path from 'path';

import { Interface, Transaction, Wallet } from 'ethers';

import {
  DEFAULT_GAS_LIMIT,
  DeploymentRecord,
  loadArtifact,
  loadDeployment,
  rpcCall,
  saveDeployment,
  waitForDeploymentReceipt,
} from './rpc';

const RPC_URL =
  process.env.RPC_URL || 'https://services.polkadothub-rpc.com/testnet';

interface ContractConfig {
  name: string;
  deploymentKey: string;
  getConstructorArgs: (ctx: DeployContext) => unknown[];
}

interface DeployContext {
  mercadoCoreAddress: string;
  ownerAddress: string;
  deployedAddresses: Record<string, string>;
}

const EXTENSION_CONTRACTS: ContractConfig[] = [
  {
    name: 'MercadoRatings',
    deploymentKey: 'mercadoRatings',
    getConstructorArgs: (ctx) => [ctx.mercadoCoreAddress, ctx.ownerAddress],
  },
  {
    name: 'RestaurantMeta',
    deploymentKey: 'restaurantMeta',
    getConstructorArgs: (ctx) => [ctx.mercadoCoreAddress],
  },
  {
    name: 'MercadoDisputes',
    deploymentKey: 'mercadoDisputes',
    getConstructorArgs: (ctx) => [ctx.mercadoCoreAddress, ctx.ownerAddress],
  },
  {
    name: 'MockMobRule',
    deploymentKey: 'mockMobRule',
    getConstructorArgs: (ctx) => [ctx.ownerAddress, ctx.mercadoCoreAddress],
  },
  {
    name: 'MercadoMatchmakers',
    deploymentKey: 'mercadoMatchmakers',
    getConstructorArgs: (ctx) => [ctx.mercadoCoreAddress, ctx.ownerAddress],
  },
];

async function deployContract(
  wallet: Wallet,
  contractName: string,
  constructorArgs: unknown[],
  chainId: number,
): Promise<string> {
  const { bytecode, abi } = loadArtifact(contractName);
  const iface = new Interface(abi);
  const encodedArgs = iface.encodeDeploy(constructorArgs);
  const deployData = bytecode + encodedArgs.slice(2);

  console.log(`  Bytecode: ${(bytecode.length - 2) / 2} bytes`);
  console.log(`  Deploy data: ${(deployData.length - 2) / 2} bytes`);

  const nonceHex = await rpcCall<string>(RPC_URL, 'eth_getTransactionCount', [
    wallet.address,
    'latest',
  ]);
  const nonce = parseInt(nonceHex, 16);

  const gasPriceHex = await rpcCall<string>(RPC_URL, 'eth_gasPrice', []);
  const gasPrice = BigInt(gasPriceHex);

  const tx = Transaction.from({
    type: 0,
    chainId,
    nonce,
    gasPrice,
    gasLimit: DEFAULT_GAS_LIMIT,
    to: undefined,
    value: 0n,
    data: deployData,
  });

  const signedTx = await wallet.signTransaction(tx);
  const txHash = await rpcCall<string>(RPC_URL, 'eth_sendRawTransaction', [
    signedTx,
  ]);
  console.log(`  Transaction: ${txHash}`);

  const receipt = await waitForDeploymentReceipt(RPC_URL, txHash);
  console.log('');

  return receipt.contractAddress;
}

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY environment variable required');
  }

  const wallet = new Wallet(privateKey);
  console.log('Deployer address:', wallet.address);

  const chainIdHex = await rpcCall<string>(RPC_URL, 'eth_chainId', []);
  const chainId = parseInt(chainIdHex, 16);
  console.log('Chain ID:', chainId);

  const deployment = loadDeployment('paseo', chainId);
  const mercadoCoreAddress = deployment.mercadoCore;
  if (!mercadoCoreAddress) {
    throw new Error('MercadoCore address not found in deployment file');
  }
  console.log('MercadoCore:', mercadoCoreAddress);

  const balanceHex = await rpcCall<string>(RPC_URL, 'eth_getBalance', [
    wallet.address,
    'latest',
  ]);
  const balance = BigInt(balanceHex);
  console.log('Balance:', balance.toString());
  console.log('');

  const ctx: DeployContext = {
    mercadoCoreAddress,
    ownerAddress: wallet.address,
    deployedAddresses: {},
  };

  // Deploy all extension contracts
  for (const contract of EXTENSION_CONTRACTS) {
    console.log(`Deploying ${contract.name}...`);
    const address = await deployContract(
      wallet,
      contract.name,
      contract.getConstructorArgs(ctx),
      chainId,
    );
    console.log(`✅ ${contract.name}: ${address}`);
    console.log('');

    ctx.deployedAddresses[contract.deploymentKey] = address;
    (deployment as Record<string, string>)[contract.deploymentKey] = address;
  }

  deployment.extensionsTimestamp = new Date().toISOString();
  const deploymentPath = saveDeployment(
    'paseo',
    chainId,
    deployment as DeploymentRecord,
  );
  console.log(`Deployment updated: ${deploymentPath}`);

  // Update .env file if it exists
  const envPath = path.join(__dirname, '../../../apps/web/.env');
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');

    const envUpdates: Record<string, string> = {
      VITE_MERCADO_ADDRESS: mercadoCoreAddress,
      VITE_MERCADO_RATINGS_ADDRESS: ctx.deployedAddresses.mercadoRatings,
      VITE_RESTAURANT_META_ADDRESS: ctx.deployedAddresses.restaurantMeta,
      VITE_MERCADO_DISPUTES_ADDRESS: ctx.deployedAddresses.mercadoDisputes,
      VITE_MOCKMOBRULE_ADDRESS: ctx.deployedAddresses.mockMobRule,
      VITE_MATCHMAKERS_ADDRESS: ctx.deployedAddresses.mercadoMatchmakers,
    };

    for (const [key, value] of Object.entries(envUpdates)) {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    }

    fs.writeFileSync(envPath, envContent);
    console.log(`Updated: ${envPath}`);
  } else {
    console.log(`Skipped .env update (file not found): ${envPath}`);
  }

  console.log('\n✅ All extension contracts deployed successfully!');
  console.log('==========================================');
  console.log('MercadoCore:', mercadoCoreAddress);
  for (const contract of EXTENSION_CONTRACTS) {
    console.log(
      `${contract.name}: ${ctx.deployedAddresses[contract.deploymentKey]}`,
    );
  }
  console.log('==========================================');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
