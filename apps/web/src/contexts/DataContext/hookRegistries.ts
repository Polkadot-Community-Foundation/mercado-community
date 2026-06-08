/**
 * Hook registries for mock vs real implementations.
 * This file imports hooks but NOT provider/context modules,
 * breaking the circular dependency.
 */
// Mock hooks
import { useMockLocations } from '../../hooks/useLocations/useMockLocations';
import { useMockRestaurants } from '../../hooks/useRestaurants/useMockRestaurants';
import { useMockRestaurant } from '../../hooks/useRestaurant/useMockRestaurant';
import { useMockPlaceOrder } from '../../hooks/usePlaceOrder/useMockPlaceOrder';
import { useMockOrder } from '../../hooks/useOrder/useMockOrder';
import { useMockAdvanceOrderStatus } from '../../hooks/useAdvanceOrderStatus/useMockAdvanceOrderStatus';
import { useMockMarkReadyForPickup } from '../../hooks/useMarkReadyForPickup/useMockMarkReadyForPickup';
import { useMockCompleteOrder } from '../../hooks/useCompleteOrder/useMockCompleteOrder';
import { useMockAccountInfo } from '../../hooks/useAccountInfo/useMockAccountInfo';
import { useMockCancelOrder } from '../../hooks/useCancelOrder/useMockCancelOrder';
import { useMockRestaurantOrders } from '../../hooks/useRestaurantOrders/useMockRestaurantOrders';
import { useMockCustomerOrders } from '../../hooks/useCustomerOrders/useMockCustomerOrders';
import { useMockRegisterRestaurant } from '../../hooks/useRegisterRestaurant/useMockRegisterRestaurant';
import { useMockBulletin } from '../../hooks/useBulletin/useMockBulletin';
import { useMockRaiseDispute } from '../../hooks/useRaiseDispute/useMockRaiseDispute';
import { useMockAddCounterEvidence } from '../../hooks/useAddCounterEvidence/useMockAddCounterEvidence';
import { useMockAcceptFault } from '../../hooks/useAcceptFault/useMockAcceptFault';
import { useMockDispute } from '../../hooks/useDispute/useMockDispute';
import { useMockCustomerDisputes } from '../../hooks/useCustomerDisputes/useMockCustomerDisputes';
import { useMockRestaurantDisputes } from '../../hooks/useRestaurantDisputes/useMockRestaurantDisputes';
import { useMockRateRestaurant } from '../../hooks/useRateRestaurant/useMockRateRestaurant';
import { useMockSetMenu } from '../../hooks/useSetMenu/useMockSetMenu';
import { useMockUpdateRestaurant } from '../../hooks/useUpdateRestaurant/useMockUpdateRestaurant';
import { useMockMatchMaker } from '../../hooks/useMatchMaker/useMockMatchMaker';
import { useMockMatchMakerRegistered } from '../../hooks/useMatchMakerRegistered/useMockMatchMakerRegistered';
import { useMockMatchMakerId } from '../../hooks/useMatchMakerId/useMockMatchMakerId';
import { useMockMatchMakerActions } from '../../hooks/useMatchMakerActions/useMockMatchMakerActions';
// Real hooks (contract interactions)
import { useRealLocations } from '../../hooks/useLocations/useRealLocations';
import { useRealBulletin } from '../../hooks/useBulletin/useRealBulletin';
import { useRealRaiseDispute } from '../../hooks/useRaiseDispute/useRealRaiseDispute';
import { useRealAddCounterEvidence } from '../../hooks/useAddCounterEvidence/useRealAddCounterEvidence';
import { useRealAcceptFault } from '../../hooks/useAcceptFault/useRealAcceptFault';
import { useRealRateRestaurant } from '../../hooks/useRateRestaurant/useRealRateRestaurant';
import { useRealRegisterRestaurant } from '../../hooks/useRegisterRestaurant/useRealRegisterRestaurant';
import { useRealPlaceOrder } from '../../hooks/usePlaceOrder/useRealPlaceOrder';
import { useRealAdvanceOrderStatus } from '../../hooks/useAdvanceOrderStatus/useRealAdvanceOrderStatus';
import { useRealCancelOrder } from '../../hooks/useCancelOrder/useRealCancelOrder';
import { useRealOrder } from '../../hooks/useOrder/useRealOrder';
import { useRealRestaurant } from '../../hooks/useRestaurant/useRealRestaurant';
import { useRealRestaurants } from '../../hooks/useRestaurants/useRealRestaurants';
import { useRealCustomerOrders } from '../../hooks/useCustomerOrders/useRealCustomerOrders';
import { useRealRestaurantOrders } from '../../hooks/useRestaurantOrders/useRealRestaurantOrders';
import { useRealDispute } from '../../hooks/useDispute/useRealDispute';
import { useRealCustomerDisputes } from '../../hooks/useCustomerDisputes/useRealCustomerDisputes';
import { useRealRestaurantDisputes } from '../../hooks/useRestaurantDisputes/useRealRestaurantDisputes';
import { useRealSetMenu } from '../../hooks/useSetMenu/useRealSetMenu';
import { useRealUpdateRestaurant } from '../../hooks/useUpdateRestaurant/useRealUpdateRestaurant';
import { useRealMatchMaker } from '../../hooks/useMatchMaker/useRealMatchMaker';
import { useRealMatchMakerRegistered } from '../../hooks/useMatchMakerRegistered/useRealMatchMakerRegistered';
import { useRealMatchMakerId } from '../../hooks/useMatchMakerId/useRealMatchMakerId';
import { useRealMatchMakerActions } from '../../hooks/useMatchMakerActions/useRealMatchMakerActions';

import type { DataContextValue } from './DataContext';

/**
 * All mock hook implementations.
 * Used for fully mocked development/testing.
 */
export const mockHooks: DataContextValue = {
  useLocations: useMockLocations,
  useRestaurants: useMockRestaurants,
  useRestaurant: useMockRestaurant,
  usePlaceOrder: useMockPlaceOrder,
  useOrder: useMockOrder,
  useAdvanceOrderStatus: useMockAdvanceOrderStatus,
  useMarkReadyForPickup: useMockMarkReadyForPickup,
  useCompleteOrder: useMockCompleteOrder,
  useAccountInfo: useMockAccountInfo,
  useCancelOrder: useMockCancelOrder,
  useRestaurantOrders: useMockRestaurantOrders,
  useCustomerOrders: useMockCustomerOrders,
  useRegisterRestaurant: useMockRegisterRestaurant,
  useBulletin: useMockBulletin,
  useRaiseDispute: useMockRaiseDispute,
  useAddCounterEvidence: useMockAddCounterEvidence,
  useAcceptFault: useMockAcceptFault,
  useDispute: useMockDispute,
  useCustomerDisputes: useMockCustomerDisputes,
  useRestaurantDisputes: useMockRestaurantDisputes,
  useRateRestaurant: useMockRateRestaurant,
  useSetMenu: useMockSetMenu,
  useUpdateRestaurant: useMockUpdateRestaurant,
  // Matchmaker hooks
  useMatchMaker: useMockMatchMaker,
  useMatchMakerRegistered: useMockMatchMakerRegistered,
  useMatchMakerId: useMockMatchMakerId,
  useMatchMakerActions: useMockMatchMakerActions,
};

/**
 * Real hook implementations for contract interactions.
 * These connect to actual wallet/chain via ContractsContext.
 */
export const realHooks: Partial<DataContextValue> = {
  // useAccountInfo is added by the provider (synced version)
  // Location (geolocation-based)
  useLocations: useRealLocations,
  // Core operations
  useRegisterRestaurant: useRealRegisterRestaurant,
  usePlaceOrder: useRealPlaceOrder,
  useAdvanceOrderStatus: useRealAdvanceOrderStatus,
  // TODO: Replace with real implementations when contract is updated
  useMarkReadyForPickup: useMockMarkReadyForPickup,
  useCompleteOrder: useMockCompleteOrder,
  useCancelOrder: useRealCancelOrder,
  // Data reading
  useOrder: useRealOrder,
  useRestaurant: useRealRestaurant,
  useRestaurants: useRealRestaurants,
  useCustomerOrders: useRealCustomerOrders,
  useRestaurantOrders: useRealRestaurantOrders,
  // Disputes
  useBulletin: useRealBulletin,
  useRaiseDispute: useRealRaiseDispute,
  useAddCounterEvidence: useRealAddCounterEvidence,
  useAcceptFault: useRealAcceptFault,
  useDispute: useRealDispute,
  useCustomerDisputes: useRealCustomerDisputes,
  useRestaurantDisputes: useRealRestaurantDisputes,
  // Ratings
  useRateRestaurant: useRealRateRestaurant,
  // Menu
  useSetMenu: useRealSetMenu,
  useUpdateRestaurant: useRealUpdateRestaurant,
  // Matchmaker
  useMatchMaker: useRealMatchMaker,
  useMatchMakerRegistered: useRealMatchMakerRegistered,
  useMatchMakerId: useRealMatchMakerId,
  useMatchMakerActions: useRealMatchMakerActions,
};
