/**
 * Pure data store for mock state.
 * This module has NO hook imports - it only defines the store context.
 * Hooks consume this store; providers create it.
 */
import { createContext, useContext } from 'react';
import type {
  Restaurant,
  Order,
  AccountInfo,
  Dispute,
  DisputeEvidence,
  MatchMaker,
} from '@mercado/types';

export type MockDataTree = {
  locations: string[];
  restaurants: Restaurant[];
  orders: Order[];
  disputes: Dispute[];
  evidenceStore: Record<string, DisputeEvidence>;
  activeAccount: AccountInfo | null;
  stakeAmount: bigint;
  matchMakers: MatchMaker[];
  matchMakerIdByOwner: Record<string, string>;
};

export type MockStoreValue = {
  data: MockDataTree;
  setData: React.Dispatch<React.SetStateAction<MockDataTree>>;
};

/**
 * Context for accessing mock data store.
 * Must be provided by a parent provider component.
 */
export const MockStoreContext = createContext<MockStoreValue | null>(null);

/**
 * Hook to access the mock data store.
 * Throws if used outside of a MockStoreProvider.
 */
export function useMockStore(): MockStoreValue {
  const store = useContext(MockStoreContext);
  if (!store) {
    throw new Error('useMockStore must be used within a MockStoreProvider');
  }
  return store;
}
