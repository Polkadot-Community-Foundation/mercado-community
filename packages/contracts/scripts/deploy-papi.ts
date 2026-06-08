/**
 * Deploy MercadoCore using raw JSON-RPC calls, with optional polkadot-api
 * support for mnemonic-based Revive pallet submission.
 *
 * This script bypasses hardhat-polkadot's micro-eth-signer which enforces
 * EIP-3860 initcode size limits that don't apply to PVM contracts.
 *
 * Usage:
 *   PRIVATE_KEY=0x... npx tsx scripts/deploy-papi.ts
 *
 * Or with mnemonic (NOTE: deployment is not persisted in mnemonic mode):
 *   MNEMONIC="word1 word2..." npx tsx scripts/deploy-papi.ts
 */
import { hexlify, Interface, keccak256, Transaction, Wallet } from 'ethers';

import { getWsEndpoint } from './network';
import {
  DEFAULT_GAS_LIMIT,
  loadArtifact,
  rpcCall,
  saveDeployment,
  waitForDeploymentReceipt,
  wsToHttpEndpoint,
} from './rpc';

// Papi-specific constants
const PAPI_REF_TIME = 50_000_000_000n;
const PAPI_PROOF_SIZE = 1_000_000n;
const PAPI_STORAGE_DEPOSIT_LIMIT = 10_000_000_000_000n;
const PAPI_DERIVATION_PATH = '//mercado';

type HexString = `0x${string}`;

interface LoadedPapiModules {
  createClient: (provider: unknown) => {
    getUnsafeApi(): unknown;
    destroy(): void;
  };
  getWsProvider: (endpoint: string) => unknown;
  Binary: {
    fromHex(hex: HexString): unknown;
    fromBytes(bytes: Uint8Array): unknown;
  };
  getPolkadotSigner: (
    publicKey: Uint8Array,
    algorithm: 'Sr25519',
    sign: (payload: Uint8Array) => Uint8Array | Promise<Uint8Array>,
  ) => unknown;
  entropyToMiniSecret: (entropy: Uint8Array) => Uint8Array;
  mnemonicToEntropy: (mnemonic: string) => Uint8Array;
  sr25519CreateDerive: (miniSecret: Uint8Array) => (derivationPath: string) => {
    publicKey: Uint8Array;
    sign: (payload: Uint8Array) => Uint8Array | Promise<Uint8Array>;
  };
}

const dynamicImport = new Function('specifier', 'return import(specifier)') as (
  specifier: string,
) => Promise<unknown>;

async function loadPapiModules(): Promise<LoadedPapiModules> {
  try {
    const [
      polkadotApiModule,
      wsProviderModule,
      signerModule,
      hdkdHelpersModule,
      hdkdModule,
    ] = await Promise.all([
      dynamicImport('polkadot-api'),
      dynamicImport('polkadot-api/ws-provider/node'),
      dynamicImport('polkadot-api/signer'),
      dynamicImport('@polkadot-labs/hdkd-helpers'),
      dynamicImport('@polkadot-labs/hdkd'),
    ]);

    const polkadotApi = polkadotApiModule as {
      createClient: LoadedPapiModules['createClient'];
      Binary: LoadedPapiModules['Binary'];
    };
    const wsProvider = wsProviderModule as {
      getWsProvider: LoadedPapiModules['getWsProvider'];
    };
    const signer = signerModule as {
      getPolkadotSigner: LoadedPapiModules['getPolkadotSigner'];
    };
    const helpers = hdkdHelpersModule as {
      entropyToMiniSecret: LoadedPapiModules['entropyToMiniSecret'];
      mnemonicToEntropy: LoadedPapiModules['mnemonicToEntropy'];
    };
    const hdkd = hdkdModule as {
      sr25519CreateDerive: LoadedPapiModules['sr25519CreateDerive'];
    };

    return {
      createClient: polkadotApi.createClient,
      getWsProvider: wsProvider.getWsProvider,
      Binary: polkadotApi.Binary,
      getPolkadotSigner: signer.getPolkadotSigner,
      entropyToMiniSecret: helpers.entropyToMiniSecret,
      mnemonicToEntropy: helpers.mnemonicToEntropy,
      sr25519CreateDerive: hdkd.sr25519CreateDerive,
    };
  } catch (error) {
    throw new Error(
      'Mnemonic-based deploy-papi mode requires optional dependencies: ' +
        'polkadot-api, @polkadot-labs/hdkd, and @polkadot-labs/hdkd-helpers.',
      { cause: error instanceof Error ? error : undefined },
    );
  }
}

function deriveEvmAddress(publicKey: Uint8Array): HexString {
  if (publicKey.length !== 32) {
    throw new Error(
      `Expected 32-byte public key, got ${publicKey.length} bytes`,
    );
  }

  const isEvmDerived = publicKey.slice(20).every((byte) => byte === 0xee);
  if (isEvmDerived) {
    return hexlify(publicKey.slice(0, 20)) as HexString;
  }

  const hash = keccak256(publicKey);
  return `0x${hash.slice(-40)}` as HexString;
}

async function deployViaRawRpc(
  rpcUrl: string,
  wallet: Wallet,
  ownerAddress: HexString,
  network: string,
): Promise<void> {
  const { bytecode, abi } = loadArtifact('MercadoCore');
  const iface = new Interface(abi);
  const constructorArgs = iface.encodeDeploy([ownerAddress]) as HexString;
  const deployData = (bytecode + constructorArgs.slice(2)) as HexString;

  console.log(`Bytecode size: ${(bytecode.length - 2) / 2} bytes`);
  console.log(`Deploy data size: ${(deployData.length - 2) / 2} bytes`);
  console.log(`Using RPC endpoint: ${rpcUrl}`);

  const chainIdHex = await rpcCall<string>(rpcUrl, 'eth_chainId', []);
  const chainId = parseInt(chainIdHex, 16);
  console.log('Chain ID:', chainId);

  const nonceHex = await rpcCall<string>(rpcUrl, 'eth_getTransactionCount', [
    wallet.address,
    'latest',
  ]);
  const nonce = parseInt(nonceHex, 16);
  console.log('Nonce:', nonce);

  const gasPriceHex = await rpcCall<string>(rpcUrl, 'eth_gasPrice', []);
  const gasPrice = BigInt(gasPriceHex);
  console.log('Gas price:', gasPrice.toString());

  console.log('Gas limit:', DEFAULT_GAS_LIMIT.toString());

  const balanceHex = await rpcCall<string>(rpcUrl, 'eth_getBalance', [
    wallet.address,
    'latest',
  ]);
  const balance = BigInt(balanceHex);
  console.log('Balance:', balance.toString());

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
  console.log('Signed transaction length:', signedTx.length);

  const txHash = await rpcCall<string>(rpcUrl, 'eth_sendRawTransaction', [
    signedTx,
  ]);
  console.log('Transaction hash:', txHash);

  console.log('\nWaiting for receipt...');
  const receipt = await waitForDeploymentReceipt(rpcUrl, txHash);
  console.log('');

  console.log('\n✅ Contract deployed successfully!');
  console.log('Contract address:', receipt.contractAddress);

  // Save deployment
  const deploymentPath = saveDeployment(network, chainId, {
    network,
    chainId: chainId.toString(),
    mercadoCore: receipt.contractAddress,
    deployer: wallet.address,
    timestamp: new Date().toISOString(),
  });
  console.log(`\nDeployment saved to: ${deploymentPath}`);
}

async function deployViaMnemonicPapi(
  wsEndpoint: string,
  mnemonic: string,
): Promise<void> {
  const {
    createClient,
    getWsProvider,
    Binary,
    getPolkadotSigner,
    entropyToMiniSecret,
    mnemonicToEntropy,
    sr25519CreateDerive,
  } = await loadPapiModules();

  const provider = getWsProvider(wsEndpoint);
  const client = createClient(provider);

  try {
    const api = client.getUnsafeApi() as {
      tx: {
        Revive: {
          instantiate_with_code(args: {
            value: bigint;
            gas_limit: { ref_time: bigint; proof_size: bigint };
            storage_deposit_limit: bigint;
            code: unknown;
            data: unknown;
            salt: unknown;
          }): {
            signAndSubmit(submitter: unknown): Promise<unknown>;
          };
        };
      };
    };

    const entropy = mnemonicToEntropy(mnemonic);
    const miniSecret = entropyToMiniSecret(entropy);
    const derive = sr25519CreateDerive(miniSecret);
    const keypair = derive(PAPI_DERIVATION_PATH);
    const signer = getPolkadotSigner(
      keypair.publicKey,
      'Sr25519',
      keypair.sign,
    );
    const evmAddress = deriveEvmAddress(keypair.publicKey);

    console.log('Using mnemonic-derived keypair');
    console.log('Deployer EVM address:', evmAddress);
    console.log(
      'NOTE: Mnemonic mode does not persist deployment to file. ' +
        'Check transaction events for the deployed contract address.',
    );

    const { bytecode, abi } = loadArtifact('MercadoCore');
    const iface = new Interface(abi);
    const constructorArgs = iface.encodeDeploy([evmAddress]) as HexString;

    console.log(`Bytecode size: ${(bytecode.length - 2) / 2} bytes`);
    console.log(
      `Deploy data size: ${(bytecode.length + constructorArgs.length - 4) / 2} bytes`,
    );

    const tx = api.tx.Revive.instantiate_with_code({
      value: 0n,
      gas_limit: {
        ref_time: PAPI_REF_TIME,
        proof_size: PAPI_PROOF_SIZE,
      },
      storage_deposit_limit: PAPI_STORAGE_DEPOSIT_LIMIT,
      code: Binary.fromHex(bytecode as HexString),
      data: Binary.fromHex(constructorArgs),
      salt: Binary.fromBytes(new Uint8Array(0)),
    });

    console.log('Submitting instantiate_with_code transaction...');
    const result = await tx.signAndSubmit(signer);
    console.log('Transaction submitted:', result);
    console.log('\n✅ Deployment transaction submitted!');
    console.log(
      'Check the transaction events for the deployed contract address.',
    );
  } finally {
    client.destroy();
  }
}

function getRpcUrl(network: string): string {
  if (process.env.RPC_URL) {
    return process.env.RPC_URL;
  }
  return wsToHttpEndpoint(getWsEndpoint(network));
}

async function main() {
  const network = process.env.NETWORK || 'paseo';
  const wsEndpoint = getWsEndpoint(network);
  const rpcUrl = getRpcUrl(network);

  console.log(`Connecting to ${wsEndpoint}...`);

  // Check for conflicting env vars
  if (process.env.MNEMONIC && process.env.PRIVATE_KEY) {
    throw new Error(
      'Both MNEMONIC and PRIVATE_KEY are set. Please use only one.',
    );
  }

  if (process.env.MNEMONIC) {
    await deployViaMnemonicPapi(wsEndpoint, process.env.MNEMONIC);
    return;
  }

  if (process.env.PRIVATE_KEY) {
    const wallet = new Wallet(process.env.PRIVATE_KEY);
    console.log('Using Ethereum private key');
    console.log('Deployer EVM address:', wallet.address);
    await deployViaRawRpc(rpcUrl, wallet, wallet.address as HexString, network);
    return;
  }

  throw new Error('PRIVATE_KEY or MNEMONIC environment variable required');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
