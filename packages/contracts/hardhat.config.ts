import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-verify';
import '@openzeppelin/hardhat-upgrades';
import 'hardhat-contract-sizer';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import '@parity/hardhat-polkadot';
import { HardhatUserConfig } from 'hardhat/config';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // Enable IR-based code generator to handle deep stacks
    },
  },
  resolc: {
    compilerSource: 'binary',
    settings: {
      resolcPath: './bin/resolc',
      memoryConfig: {
        heapSize: 128000,
        stackSize: 128000,
      },
    },
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      chainId: 31337,
      blockGasLimit: 16777216,
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337,
    },
    paseo: {
      url:
        process.env.PASEO_RPC_URL || 'https://eth-rpc-paseo-next.polkadot.io',
      chainId: 420420417,
      // PRIVATE_KEY is required for testnet deployments to prevent accidental
      // use of well-known test keys. Set via environment variable.
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      polkadot: {
        target: 'pvm',
      },
    },
    // Paseo V2 (Paseo Next) - same RPC but different genesis hash
    'paseo-v2': {
      url:
        process.env.PASEO_V2_RPC_URL ||
        process.env.PASEO_RPC_URL ||
        'https://eth-rpc-paseo-next.polkadot.io',
      chainId: 420420417,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      polkadot: {
        target: 'pvm',
      },
    },
    previewnet: {
      url:
        process.env.PREVIEWNET_RPC_URL ||
        'https://previewnet.substrate.dev/eth-rpc',
      chainId: 420420421,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      polkadot: {
        target: 'pvm',
      },
    },
    // Summit Asset Hub. There is NO public Summit eth-rpc endpoint — point
    // SUMMIT_RPC_URL at a local revive eth-rpc adapter (e.g. the dotns adapter
    // exposing http://localhost:8545 -> wss://summit-asset-hub-rpc.polkadot.io).
    // Note: same EVM chainId (420420417) as Paseo — the RPC host decides which
    // chain you actually hit, not the id.
    summit: {
      url: process.env.SUMMIT_RPC_URL || 'http://localhost:8545',
      chainId: 420420417,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      polkadot: {
        target: 'pvm',
      },
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === 'true',
    currency: 'USD',
  },
  etherscan: {
    apiKey: {
      paseo: 'dummy',
    },
    customChains: [
      {
        network: 'paseo',
        chainId: 420420417,
        urls: {
          apiURL: 'https://blockscout-testnet.polkadot.io/api',
          browserURL: 'https://blockscout-testnet.polkadot.io',
        },
      },
    ],
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  typechain: {
    outDir: './typechain-types',
    target: 'ethers-v6',
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: false,
  },
};

export default config;
