import { restaurants, accounts, disputes } from '@mercado/mocks';

import type { MockDataTree } from '../../stores';

// Re-export for convenience
export type { MockDataTree } from '../../stores';

export const DEFAULT_MOCK_DATA: MockDataTree = {
  locations: restaurants.allLocations,
  restaurants: restaurants.allRestaurants,
  orders: [],
  disputes: [],
  evidenceStore: {},
  activeAccount: accounts.defaultAccount,
  stakeAmount: disputes.defaultStakeAmount,
  matchMakers: [
    {
      id: '1',
      owner: '0x0000000000000000000000000000000000000001',
      name: 'Mercado',
      feePercentage: 500, // 5%
      registeredAt: Date.now(),
      active: true,
      feesAccumulated: 0n,
    },
  ],
  matchMakerIdByOwner: {
    '0x0000000000000000000000000000000000000001': '1',
  },
};
