import { Dispute, DisputeStatus, Verdict } from '@mercado/types';

import { alice, bob } from './accounts';

// Dispute stake amount in pUSD cents (5.00 pUSD)
export const defaultStakeAmount = 500n;

// Open dispute - customer raised, waiting for restaurant response
export const disputeOpen: Dispute = {
  id: 'dispute-1',
  orderId: 'order-completed-1',
  customerId: alice.address,
  restaurantId: '1', // Burger Palace
  status: DisputeStatus.OPEN,
  verdict: Verdict.Pending,
  initiatorEvidenceCID: 'bafkreiexample1',
  initiatorStake: defaultStakeAmount,
  challengerStake: 0n,
  faultAccepted: false,
  initiator: 'customer',
  createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
};

// Dispute with counter-evidence - under review
export const disputeUnderReview: Dispute = {
  id: 'dispute-2',
  orderId: 'order-completed-2',
  customerId: bob.address,
  restaurantId: '2', // Pizza Heaven
  status: DisputeStatus.OPEN,
  verdict: Verdict.Pending,
  initiatorEvidenceCID: 'bafkreiexample2',
  counterEvidenceCID: 'bafkreiexample2counter',
  initiatorStake: defaultStakeAmount,
  challengerStake: defaultStakeAmount,
  faultAccepted: false,
  initiator: 'customer',
  createdAt: Date.now() - 1000 * 60 * 60 * 12, // 12 hours ago
};

// Resolved dispute - customer wins
export const disputeCustomerWins: Dispute = {
  id: 'dispute-3',
  orderId: 'order-completed-3',
  customerId: alice.address,
  restaurantId: '3', // Sushi Express
  status: DisputeStatus.RESOLVED,
  verdict: Verdict.CustomerWins,
  initiatorEvidenceCID: 'bafkreiexample3',
  counterEvidenceCID: 'bafkreiexample3counter',
  initiatorStake: defaultStakeAmount,
  challengerStake: defaultStakeAmount,
  faultAccepted: false,
  initiator: 'customer',
  createdAt: Date.now() - 1000 * 60 * 60 * 48, // 48 hours ago
  resolvedAt: Date.now() - 1000 * 60 * 60 * 24, // 24 hours ago
};

// Resolved dispute - restaurant wins
export const disputeRestaurantWins: Dispute = {
  id: 'dispute-4',
  orderId: 'order-completed-4',
  customerId: bob.address,
  restaurantId: '1', // Burger Palace
  status: DisputeStatus.RESOLVED,
  verdict: Verdict.RestaurantWins,
  initiatorEvidenceCID: 'bafkreiexample4',
  counterEvidenceCID: 'bafkreiexample4counter',
  initiatorStake: defaultStakeAmount,
  challengerStake: defaultStakeAmount,
  faultAccepted: false,
  initiator: 'customer',
  createdAt: Date.now() - 1000 * 60 * 60 * 72, // 72 hours ago
  resolvedAt: Date.now() - 1000 * 60 * 60 * 48, // 48 hours ago
};

// Resolved dispute - fault accepted (no counter-evidence)
export const disputeFaultAccepted: Dispute = {
  id: 'dispute-5',
  orderId: 'order-completed-5',
  customerId: alice.address,
  restaurantId: '4', // Taco Town
  status: DisputeStatus.RESOLVED,
  verdict: Verdict.CustomerWins,
  initiatorEvidenceCID: 'bafkreiexample5',
  initiatorStake: defaultStakeAmount,
  challengerStake: 0n,
  faultAccepted: true,
  initiator: 'customer',
  createdAt: Date.now() - 1000 * 60 * 60 * 36, // 36 hours ago
  resolvedAt: Date.now() - 1000 * 60 * 60 * 35, // 35 hours ago
};

export const allDisputes: Dispute[] = [
  disputeOpen,
  disputeUnderReview,
  disputeCustomerWins,
  disputeRestaurantWins,
  disputeFaultAccepted,
];
