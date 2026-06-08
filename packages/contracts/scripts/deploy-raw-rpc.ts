/**
 * Deploy MercadoCore using raw JSON-RPC calls.
 *
 * This script bypasses hardhat-polkadot's micro-eth-signer which enforces
 * EIP-3860 initcode size limits that don't apply to PVM contracts.
 *
 * Usage:
 *   PRIVATE_KEY=0x... npx tsx scripts/deploy-raw-rpc.ts
 */
import { Interface, Transaction, Wallet } from 'ethers';

import {
  DEFAULT_GAS_LIMIT,
  loadArtifact,
  rpcCall,
  saveDeployment,
  waitForDeploymentReceipt,
} from './rpc';

const RPC_URL =
  process.env.RPC_URL || 'https://services.polkadothub-rpc.com/testnet';

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY environment variable required');
  }

  const wallet = new Wallet(privateKey);
  console.log('Deployer address:', wallet.address);

  const { bytecode, abi } = loadArtifact('MercadoCore');
  console.log(`Bytecode size: ${(bytecode.length - 2) / 2} bytes`);

  // Encode constructor arguments (owner address)
  const iface = new Interface(abi);
  const constructorArgs = iface.encodeDeploy([wallet.address]);
  const deployData = bytecode + constructorArgs.slice(2);
  console.log(`Deploy data size: ${(deployData.length - 2) / 2} bytes`);

  // Get chain ID
  const chainIdHex = await rpcCall<string>(RPC_URL, 'eth_chainId', []);
  const chainId = parseInt(chainIdHex, 16);
  console.log('Chain ID:', chainId);

  // Get nonce
  const nonceHex = await rpcCall<string>(RPC_URL, 'eth_getTransactionCount', [
    wallet.address,
    'latest',
  ]);
  const nonce = parseInt(nonceHex, 16);
  console.log('Nonce:', nonce);

  // Get gas price
  const gasPriceHex = await rpcCall<string>(RPC_URL, 'eth_gasPrice', []);
  const gasPrice = BigInt(gasPriceHex);
  console.log('Gas price:', gasPrice.toString());

  console.log('Gas limit:', DEFAULT_GAS_LIMIT.toString());

  // Check balance
  const balanceHex = await rpcCall<string>(RPC_URL, 'eth_getBalance', [
    wallet.address,
    'latest',
  ]);
  const balance = BigInt(balanceHex);
  console.log('Balance:', balance.toString());

  // Build transaction (legacy type 0 for simplicity)
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

  console.log('\nSigning transaction...');
  const signedTx = await wallet.signTransaction(tx);
  console.log('Signed transaction length:', signedTx.length);

  console.log('\nSending transaction...');
  const txHash = await rpcCall<string>(RPC_URL, 'eth_sendRawTransaction', [
    signedTx,
  ]);
  console.log('Transaction hash:', txHash);

  console.log('\nWaiting for receipt...');
  const receipt = await waitForDeploymentReceipt(RPC_URL, txHash);
  console.log('');

  console.log('\n✅ Contract deployed successfully!');
  console.log('Contract address:', receipt.contractAddress);

  // Save deployment
  const deploymentPath = saveDeployment('paseo', chainId, {
    network: 'paseo',
    chainId: chainId.toString(),
    mercadoCore: receipt.contractAddress,
    deployer: wallet.address,
    timestamp: new Date().toISOString(),
  });
  console.log(`\nDeployment saved to: ${deploymentPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
