import { vi } from 'vitest';

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
// Dispute hooks
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
// Matchmaker hooks
import { useMockMatchMaker } from '../../hooks/useMatchMaker/useMockMatchMaker';
import { useMockMatchMakerRegistered } from '../../hooks/useMatchMakerRegistered/useMockMatchMakerRegistered';
import { useMockMatchMakerId } from '../../hooks/useMatchMakerId/useMockMatchMakerId';
import { useMockMatchMakerActions } from '../../hooks/useMatchMakerActions/useMockMatchMakerActions';

import type { DataContextValue } from './DataContext';

export const useLocationsSpy = vi.fn(useMockLocations);
export const useRestaurantsSpy = vi.fn(useMockRestaurants);
export const useRestaurantSpy = vi.fn(useMockRestaurant);
export const usePlaceOrderSpy = vi.fn(useMockPlaceOrder);
export const useOrderSpy = vi.fn(useMockOrder);
export const useAdvanceOrderStatusSpy = vi.fn(useMockAdvanceOrderStatus);
export const useMarkReadyForPickupSpy = vi.fn(useMockMarkReadyForPickup);
export const useCompleteOrderSpy = vi.fn(useMockCompleteOrder);
export const useAccountInfoSpy = vi.fn(useMockAccountInfo);
export const useCancelOrderSpy = vi.fn(useMockCancelOrder);
export const useRestaurantOrdersSpy = vi.fn(useMockRestaurantOrders);
export const useCustomerOrdersSpy = vi.fn(useMockCustomerOrders);
export const useRegisterRestaurantSpy = vi.fn(useMockRegisterRestaurant);
// Dispute hooks
export const useBulletinSpy = vi.fn(useMockBulletin);
export const useRaiseDisputeSpy = vi.fn(useMockRaiseDispute);
export const useAddCounterEvidenceSpy = vi.fn(useMockAddCounterEvidence);
export const useAcceptFaultSpy = vi.fn(useMockAcceptFault);
export const useDisputeSpy = vi.fn(useMockDispute);
export const useCustomerDisputesSpy = vi.fn(useMockCustomerDisputes);
export const useRestaurantDisputesSpy = vi.fn(useMockRestaurantDisputes);
export const useRateRestaurantSpy = vi.fn(useMockRateRestaurant);
export const useSetMenuSpy = vi.fn(useMockSetMenu);
export const useUpdateRestaurantSpy = vi.fn(useMockUpdateRestaurant);
// Matchmaker hooks
export const useMatchMakerSpy = vi.fn(useMockMatchMaker);
export const useMatchMakerRegisteredSpy = vi.fn(useMockMatchMakerRegistered);
export const useMatchMakerIdSpy = vi.fn(useMockMatchMakerId);
export const useMatchMakerActionsSpy = vi.fn(useMockMatchMakerActions);

export function resetSpies() {
  useLocationsSpy.mockClear().mockImplementation(useMockLocations);
  useRestaurantsSpy.mockClear().mockImplementation(useMockRestaurants);
  useRestaurantSpy.mockClear().mockImplementation(useMockRestaurant);
  usePlaceOrderSpy.mockClear().mockImplementation(useMockPlaceOrder);
  useOrderSpy.mockClear().mockImplementation(useMockOrder);
  useAdvanceOrderStatusSpy
    .mockClear()
    .mockImplementation(useMockAdvanceOrderStatus);
  useMarkReadyForPickupSpy
    .mockClear()
    .mockImplementation(useMockMarkReadyForPickup);
  useCompleteOrderSpy.mockClear().mockImplementation(useMockCompleteOrder);
  useAccountInfoSpy.mockClear().mockImplementation(useMockAccountInfo);
  useCancelOrderSpy.mockClear().mockImplementation(useMockCancelOrder);
  useRestaurantOrdersSpy
    .mockClear()
    .mockImplementation(useMockRestaurantOrders);
  useCustomerOrdersSpy.mockClear().mockImplementation(useMockCustomerOrders);
  useRegisterRestaurantSpy
    .mockClear()
    .mockImplementation(useMockRegisterRestaurant);
  // Dispute hooks
  useBulletinSpy.mockClear().mockImplementation(useMockBulletin);
  useRaiseDisputeSpy.mockClear().mockImplementation(useMockRaiseDispute);
  useAddCounterEvidenceSpy
    .mockClear()
    .mockImplementation(useMockAddCounterEvidence);
  useAcceptFaultSpy.mockClear().mockImplementation(useMockAcceptFault);
  useDisputeSpy.mockClear().mockImplementation(useMockDispute);
  useCustomerDisputesSpy
    .mockClear()
    .mockImplementation(useMockCustomerDisputes);
  useRestaurantDisputesSpy
    .mockClear()
    .mockImplementation(useMockRestaurantDisputes);
  useRateRestaurantSpy.mockClear().mockImplementation(useMockRateRestaurant);
  useSetMenuSpy.mockClear().mockImplementation(useMockSetMenu);
  useUpdateRestaurantSpy
    .mockClear()
    .mockImplementation(useMockUpdateRestaurant);
  // Matchmaker hooks
  useMatchMakerSpy.mockClear().mockImplementation(useMockMatchMaker);
  useMatchMakerRegisteredSpy
    .mockClear()
    .mockImplementation(useMockMatchMakerRegistered);
  useMatchMakerIdSpy.mockClear().mockImplementation(useMockMatchMakerId);
  useMatchMakerActionsSpy
    .mockClear()
    .mockImplementation(useMockMatchMakerActions);
}

export const testHooks: DataContextValue = {
  useLocations: useLocationsSpy,
  useRestaurants: useRestaurantsSpy,
  useRestaurant: useRestaurantSpy,
  usePlaceOrder: usePlaceOrderSpy,
  useOrder: useOrderSpy,
  useAdvanceOrderStatus: useAdvanceOrderStatusSpy,
  useMarkReadyForPickup: useMarkReadyForPickupSpy,
  useCompleteOrder: useCompleteOrderSpy,
  useAccountInfo: useAccountInfoSpy,
  useCancelOrder: useCancelOrderSpy,
  useRestaurantOrders: useRestaurantOrdersSpy,
  useCustomerOrders: useCustomerOrdersSpy,
  useRegisterRestaurant: useRegisterRestaurantSpy,
  // Dispute hooks
  useBulletin: useBulletinSpy,
  useRaiseDispute: useRaiseDisputeSpy,
  useAddCounterEvidence: useAddCounterEvidenceSpy,
  useAcceptFault: useAcceptFaultSpy,
  useDispute: useDisputeSpy,
  useCustomerDisputes: useCustomerDisputesSpy,
  useRestaurantDisputes: useRestaurantDisputesSpy,
  useRateRestaurant: useRateRestaurantSpy,
  useSetMenu: useSetMenuSpy,
  useUpdateRestaurant: useUpdateRestaurantSpy,
  // Matchmaker hooks
  useMatchMaker: useMatchMakerSpy,
  useMatchMakerRegistered: useMatchMakerRegisteredSpy,
  useMatchMakerId: useMatchMakerIdSpy,
  useMatchMakerActions: useMatchMakerActionsSpy,
};
