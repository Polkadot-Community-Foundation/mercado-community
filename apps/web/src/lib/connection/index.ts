export {
  CORE_ADDRESS,
  RATINGS_ADDRESS,
  DISPUTES_ADDRESS,
  META_ADDRESS,
  MATCHMAKERS_ADDRESS,
  GENESIS_HASH,
  WS_RPC_ENDPOINT,
  RELAY_CHAIN_SPEC,
  PARA_CHAIN_SPEC,
  CONNECTION_MODE_STORAGE_KEY,
  SUMMIT_ASSET_HUB_GENESIS,
} from './config';

export {
  detectConnectionMode,
  loadChainSpecs,
  type ConnectionMode,
  type ChainSpecs,
} from './detect';

export {
  createContractInstances,
  type ContractInstances,
} from './createContracts';
