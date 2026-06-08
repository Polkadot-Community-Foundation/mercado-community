/**
 * Contract tuple type definitions.
 *
 * These types represent the raw tuple data returned from contract reads.
 * Use the corresponding decoder functions to convert them to domain types.
 */

/** MercadoCore.orders(uint256) return type */
export type OrderTuple = [
  customer: string,
  restaurantId: bigint,
  price: bigint,
  status: number,
  completedAt: bigint,
];

/** MercadoCore.restaurants(uint256) return type */
export type RestaurantCoreTuple = [
  owner: string,
  name: string,
  location: string,
  isOpen: boolean,
];

/** RestaurantMeta.getMetadata(uint256) return type */
export type RestaurantMetaTuple = [
  description: string,
  avatarUrl: string,
  menuCID: string,
  category: string,
  updatedAt: bigint,
];

/** MercadoRatings.getAverage(uint256) return type */
export type RatingTuple = [average: bigint, count: bigint];

/** MercadoDisputes.disputes(uint256) return type */
export type DisputeTuple = [
  orderId: bigint,
  initiator: string,
  evidenceCID: string,
  counterCID: string,
  initiatorStake: bigint,
  challengerStake: bigint,
  createdAt: bigint,
  verdict: number,
  claimed: boolean,
  faultAccepted: boolean,
  resolvedAt: bigint,
];

/** MercadoMatchmakers.getMatchMaker(uint256) return type */
export type MatchMakerTuple = [
  id: bigint,
  owner: string,
  name: string,
  feePercentage: number,
  registeredAt: bigint,
  active: boolean,
];
