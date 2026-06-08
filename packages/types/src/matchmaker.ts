export type MatchMaker = {
  id: string;
  owner: string;
  name: string;
  feePercentage: number; // basis points (100 = 1%, max 1000 = 10%)
  registeredAt: number;
  active: boolean;
  feesAccumulated: bigint;
};

export type MatchMakerRegistrationInput = {
  name: string;
  feePercentage: number; // percentage (0-10), converted to bps in contract
};

export type PriceBreakdown = {
  subtotal: bigint;
  feePercentage: number; // basis points
  feeAmount: bigint;
  total: bigint;
};
