export enum DisputeStatus {
  OPEN = 0,
  RESOLVED = 1,
}

export enum Verdict {
  Pending = 0,
  CustomerWins = 1,
  RestaurantWins = 2,
}

// Customer-initiated dispute reasons
export type CustomerDisputeReason =
  | 'wrong_items'
  | 'incomplete_order'
  | 'food_quality'
  | 'not_ready'
  | 'other';

// Restaurant-initiated dispute reasons
export type RestaurantDisputeReason =
  | 'customer_no_show'
  | 'order_rejected'
  | 'payment_issue'
  | 'other';

export type DisputeReason = CustomerDisputeReason | RestaurantDisputeReason;

export type DisputeEvidence = {
  version: '1.0';
  title: string;
  description: string;
  disputeType?: DisputeReason;
  photos?: string[];
  submittedBy: 'customer' | 'restaurant';
  timestamp: number;
};

export type Dispute = {
  id: string;
  orderId: string;
  customerId: string;
  restaurantId: string;

  // Status
  status: DisputeStatus;
  verdict: Verdict;

  // Evidence (stored as Bulletin Chain CIDs)
  initiatorEvidenceCID: string;
  counterEvidenceCID?: string;

  // Staking
  initiatorStake: bigint;
  challengerStake: bigint;
  faultAccepted: boolean;

  // Metadata
  initiator: 'customer' | 'restaurant';
  createdAt: number;
  resolvedAt?: number;
};

// For MockMobRule admin
export type Case = {
  id: string;
  disputeId: string;
  initiator: string;
  initiatorStake: bigint;
  challengerStake: bigint;
  verdict: Verdict;
};
