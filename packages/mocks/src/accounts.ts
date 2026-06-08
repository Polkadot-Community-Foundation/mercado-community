import type { AccountInfo } from '@mercado/types';

// Customer accounts (dev accounts used in tests)
// Addresses are product-account derivations from the test host SDK
export const alice: AccountInfo = {
  name: 'Alice',
  address: '5Cg2z9gGmdXoi7oRcei3jcfTQiNVUBUyuWMmVzz57mgPam1v',
};

export const bob: AccountInfo = {
  name: 'Bob',
  address: '5CPK4YZxT4xwMTguqufyvvtHTTeDM85NbHXH2JQiXk1vCtXy',
};

// Restaurant owner accounts
export const charlie: AccountInfo = {
  name: 'Charlie',
  address: '5GsCnUmrKsxQDok7c2XQjUAKgHkZgJRyfJUmAR7kSFYDWogT',
};

export const dave: AccountInfo = {
  name: 'Dave',
  address: '5FA9VpUqDNDFRZBRqyNCCy9h3x2CsKcCZCJ7At8Uo4o1H7xj',
};

export const eve: AccountInfo = {
  name: 'Eve',
  address: '5FNdiXWB2kBHgYgyVwkq5Q5VQUt9YKxnVMbUL6PrT5PhTk5b',
};

export const ferdie: AccountInfo = {
  name: 'Ferdie',
  address: '5CMjRRA6CwvBtLRJGZtesmzhyhjt6DaniwyP1GPaGRrW1Eak',
};

export const grace: AccountInfo = {
  name: 'Grace',
  address: '5D2PnFMHEat5MbHR1mMCxJBs5LxRCnGGEMG4RVjSNQ3Kz4MX',
};

export const heather: AccountInfo = {
  name: 'Heather',
  address: '5DFhGA87VsMATfAQi9X97LmFRfioMuGqx2Be5r1bK9XQNTYU',
};

export const ivan: AccountInfo = {
  name: 'Ivan',
  address: '5DkRqk7mDmi3TLXqwmRHMfFjBEayAiGQFSaF1uC1bDjzhKce',
};

export const allAccounts: AccountInfo[] = [
  alice,
  bob,
  charlie,
  dave,
  eve,
  ferdie,
  grace,
  heather,
  ivan,
];

export const defaultAccount: AccountInfo = alice;
