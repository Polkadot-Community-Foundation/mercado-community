import { createContext, useContext } from 'react';
import type { PolkadotSigner } from 'polkadot-api';

import type {
  Restaurant,
  OrderItem,
  Order,
  AccountInfo,
  Dispute,
  DisputeEvidence,
  DisputeReason,
  Dish,
  MatchMaker,
  MatchMakerRegistrationInput,
} from '../../types';

export type UseLocationsResult = {
  locations: string[];
  /** Whether location detection is in progress (optional, real hook only) */
  isDetecting?: boolean;
  /** Trigger location detection manually (optional, real hook only) */
  detectLocation?: () => Promise<void>;
};

export type UseRestaurantsResult = {
  restaurants: Restaurant[];
  isLoading?: boolean;
};

export type UseRestaurantResult = {
  restaurant: Restaurant | undefined;
  isLoading?: boolean;
};

export type UsePlaceOrderResult = {
  placeOrder: (
    restaurantId: string,
    items: OrderItem[],
    totalPrice: bigint,
    matchmakerId?: string,
  ) => string | Promise<string>;
};

export type UseOrderResult = {
  order: Order | undefined;
  isLoading?: boolean;
};

export type UseAdvanceOrderStatusResult = {
  advance: (orderId: string, onSuccess?: () => void) => Promise<void>;
};

/** Result from marking an order ready for pickup */
export type MarkReadyResult = {
  /** The 6-digit code to show to the restaurant */
  displayCode: string;
  /** The full secret (for debugging/logging only) */
  secret: `0x${string}`;
};

export type UseMarkReadyForPickupResult = {
  markReady: (
    orderId: string,
    onSuccess?: (result: MarkReadyResult) => void,
  ) => Promise<MarkReadyResult>;
};

export type UseCompleteOrderResult = {
  complete: (
    orderId: string,
    displayCode: string,
    onSuccess?: () => void,
  ) => Promise<void>;
};

export type UseAccountInfoResult = {
  account: AccountInfo | null;
  restaurantId: string | null;
  signer: PolkadotSigner | null;
  isLoading: boolean;
};

export type UseCancelOrderResult = {
  cancel: (orderId: string, onSuccess?: () => void) => Promise<void>;
};
export type UseRestaurantOrdersResult = {
  orders: Order[];
  /** True if more orders exist beyond the scan limit */
  hasMore?: boolean;
  /** Number of orders that failed to load (partial failure) */
  failedCount?: number;
};

export type CustomerOrder = {
  order: Order;
  restaurantName: string;
};
export type UseCustomerOrdersResult = {
  orders: CustomerOrder[];
  /** True if more orders exist beyond the scan limit */
  hasMore?: boolean;
  /** Number of orders that failed to load (partial failure) */
  failedCount?: number;
};

export type RegisterRestaurantInput = {
  name: string;
  location: string;
  description: string;
  avatarUrl?: string;
  category?: string;
};
export type UseRegisterRestaurantResult = {
  register: (input: RegisterRestaurantInput) => string | Promise<string>;
};

// Bulletin Chain (evidence upload)
export type UseBulletinResult = {
  uploadEvidence: (
    evidence: DisputeEvidence,
    photos?: File[],
  ) => Promise<string>;
};

// Dispute hooks
export type RaiseDisputeInput = {
  orderId: string;
  reason: DisputeReason;
  title: string;
  description: string;
  photos?: File[];
  initiator?: 'customer' | 'restaurant';
  /** Progress callback for multi-step operation */
  onProgress?: (phase: string, message: string) => void;
};
export type UseRaiseDisputeResult = {
  raiseDispute: (input: RaiseDisputeInput) => Promise<string>;
  stakeAmount: bigint;
};

export type AddCounterEvidenceInput = {
  disputeId: string;
  title: string;
  description: string;
  photos?: File[];
};
export type UseAddCounterEvidenceResult = {
  addCounterEvidence: (input: AddCounterEvidenceInput) => Promise<void>;
  stakeAmount: bigint;
};

export type UseAcceptFaultResult = {
  acceptFault: (disputeId: string) => Promise<void>;
};

export type UseDisputeResult = {
  dispute: Dispute | undefined;
  initiatorEvidence: DisputeEvidence | undefined;
  counterEvidence: DisputeEvidence | undefined;
};

export type CustomerDispute = {
  dispute: Dispute;
  restaurantName: string;
};
export type UseCustomerDisputesResult = {
  disputes: CustomerDispute[];
  /** True if more disputes exist beyond the scan limit */
  hasMore?: boolean;
  /** Number of disputes that failed to load (partial failure) */
  failedCount?: number;
};

export type RestaurantDispute = {
  dispute: Dispute;
  customerAddress: string;
  responseWindowExpired?: boolean;
};
export type UseRestaurantDisputesResult = {
  disputes: RestaurantDispute[];
  /** True if more disputes exist beyond the scan limit */
  hasMore?: boolean;
  /** Number of disputes that failed to load (partial failure) */
  failedCount?: number;
};

export type UseRateRestaurantResult = {
  rateRestaurant: (
    orderId: string,
    rating: number,
    onSuccess?: () => void,
  ) => Promise<void>;
};

export type UseSetMenuResult = {
  setMenu: (dishes: Dish[]) => Promise<string>;
};

export type UpdateRestaurantInput = {
  description?: string;
  avatarFile?: File;
};
export type UseUpdateRestaurantResult = {
  updateRestaurant: (input: UpdateRestaurantInput) => Promise<void>;
};

// Matchmaker hooks
export type UseMatchMakerResult = {
  matchMaker: MatchMaker | null;
  isLoading?: boolean;
};

export type UseMatchMakerRegisteredResult = {
  isRegistered: boolean;
  isLoading?: boolean;
};

export type UseMatchMakerIdResult = {
  matchMakerId: string | null;
  isLoading?: boolean;
};

export type UseMatchMakerActionsResult = {
  registerMatchMaker: (input: MatchMakerRegistrationInput) => Promise<string>;
  updateFee: (newFeePercent: number) => Promise<void>;
  claimFees: (toAddress: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
};

export type DataContextValue = {
  useLocations: () => UseLocationsResult;
  useRestaurants: (
    location: string,
    category?: string | null,
  ) => UseRestaurantsResult;
  useRestaurant: (id: string) => UseRestaurantResult;
  usePlaceOrder: () => UsePlaceOrderResult;
  useOrder: (orderId: string) => UseOrderResult;
  useAdvanceOrderStatus: () => UseAdvanceOrderStatusResult;
  useMarkReadyForPickup: () => UseMarkReadyForPickupResult;
  useCompleteOrder: () => UseCompleteOrderResult;
  useAccountInfo: () => UseAccountInfoResult;
  useCancelOrder: () => UseCancelOrderResult;
  useRestaurantOrders: () => UseRestaurantOrdersResult;
  useCustomerOrders: () => UseCustomerOrdersResult;
  useRegisterRestaurant: () => UseRegisterRestaurantResult;
  // Dispute hooks
  useBulletin: () => UseBulletinResult;
  useRaiseDispute: () => UseRaiseDisputeResult;
  useAddCounterEvidence: () => UseAddCounterEvidenceResult;
  useAcceptFault: () => UseAcceptFaultResult;
  useDispute: (disputeId: string) => UseDisputeResult;
  useCustomerDisputes: () => UseCustomerDisputesResult;
  useRestaurantDisputes: () => UseRestaurantDisputesResult;
  useRateRestaurant: () => UseRateRestaurantResult;
  useSetMenu: () => UseSetMenuResult;
  useUpdateRestaurant: () => UseUpdateRestaurantResult;
  // Matchmaker hooks
  useMatchMaker: (id: string) => UseMatchMakerResult;
  useMatchMakerRegistered: (
    address?: string | null,
  ) => UseMatchMakerRegisteredResult;
  useMatchMakerId: (address?: string | null) => UseMatchMakerIdResult;
  useMatchMakerActions: () => UseMatchMakerActionsResult;
};

const DataContext = createContext<DataContextValue | null>(null);

export function useDataContext(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('DataProvider is required');
  return ctx;
}

export const DataProvider = DataContext.Provider;
