import type { Order } from '@mercado/types';

import { alice } from './accounts';

export const orderPlaced: Order = {
  id: 'order-1',
  customerId: alice.address,
  restaurantId: '1',
  items: [{ dishId: 'd2', selectedOptionIds: ['o8', 'o9'] }],
  totalPrice: 1800n,
  status: 'PLACED',
  createdAt: Date.now(),
};

export const orderConfirmed: Order = {
  ...orderPlaced,
  id: 'order-2',
  status: 'CONFIRMED',
};

export const orderCompleted: Order = {
  ...orderPlaced,
  id: 'order-3',
  status: 'COMPLETED',
};

export const orderCanceled: Order = {
  ...orderPlaced,
  id: 'order-4',
  status: 'CANCELED',
  canceledBy: 'customer',
};
