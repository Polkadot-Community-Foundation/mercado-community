/**
 * Contract instance creation.
 */
import {
  createEvmContract,
  MercadoCoreAbi,
  MercadoRatingsAbi,
  MercadoDisputesAbi,
  RestaurantMetaAbi,
  MercadoMatchmakersAbi,
  type EvmContract,
  type ReviveTypedApi,
} from '../contracts';

import {
  CORE_ADDRESS,
  RATINGS_ADDRESS,
  DISPUTES_ADDRESS,
  META_ADDRESS,
  MATCHMAKERS_ADDRESS,
} from './config';

export interface ContractInstances {
  core: EvmContract | null;
  ratings: EvmContract | null;
  disputes: EvmContract | null;
  restaurantMeta: EvmContract | null;
  matchmakers: EvmContract | null;
}

/**
 * Create all contract instances from a typed API.
 *
 * @param typedApi - The Revive typed API from polkadot-api
 * @param getNativeToEvmRatio - Function to get the current native-to-EVM ratio
 * @returns Object containing all contract instances (or null if address not configured)
 */
export function createContractInstances(
  typedApi: ReviveTypedApi,
  getNativeToEvmRatio: () => bigint,
): ContractInstances {
  return {
    core: CORE_ADDRESS
      ? createEvmContract(
          typedApi,
          CORE_ADDRESS,
          MercadoCoreAbi,
          getNativeToEvmRatio,
        )
      : null,
    ratings: RATINGS_ADDRESS
      ? createEvmContract(
          typedApi,
          RATINGS_ADDRESS,
          MercadoRatingsAbi,
          getNativeToEvmRatio,
        )
      : null,
    disputes: DISPUTES_ADDRESS
      ? createEvmContract(
          typedApi,
          DISPUTES_ADDRESS,
          MercadoDisputesAbi,
          getNativeToEvmRatio,
        )
      : null,
    restaurantMeta: META_ADDRESS
      ? createEvmContract(
          typedApi,
          META_ADDRESS,
          RestaurantMetaAbi,
          getNativeToEvmRatio,
        )
      : null,
    matchmakers: MATCHMAKERS_ADDRESS
      ? createEvmContract(
          typedApi,
          MATCHMAKERS_ADDRESS,
          MercadoMatchmakersAbi,
          getNativeToEvmRatio,
        )
      : null,
  };
}
