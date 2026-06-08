import type { Meta, StoryObj } from '@storybook/react';

import type { Order } from '../../types';

import {
  RestaurantOrderList,
  groupOrdersByStatus,
  groupOrdersByDate,
} from './RestaurantOrderList';

const meta = {
  title: 'Components/RestaurantOrderList',
  component: RestaurantOrderList,
} satisfies Meta<typeof RestaurantOrderList>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockOrders: Order[] = [
  {
    id: 'order-1',
    customerId: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    restaurantId: 'rest-1',
    items: [
      { dishId: 'dish-1', selectedOptionIds: [] },
      { dishId: 'dish-2', selectedOptionIds: [] },
    ],
    totalPrice: 2500n,
    status: 'PLACED',
    createdAt: Date.now() - 1000 * 60 * 5,
  },
  {
    id: 'order-2',
    customerId: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    restaurantId: 'rest-1',
    items: [{ dishId: 'dish-3', selectedOptionIds: [] }],
    totalPrice: 1200n,
    status: 'CONFIRMED',
    createdAt: Date.now() - 1000 * 60 * 10,
  },
  {
    id: 'order-3',
    customerId: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
    restaurantId: 'rest-1',
    items: [
      { dishId: 'dish-1', selectedOptionIds: [] },
      { dishId: 'dish-4', selectedOptionIds: [] },
    ],
    totalPrice: 3100n,
    status: 'PREPARING',
    createdAt: Date.now() - 1000 * 60 * 15,
  },
  {
    id: 'order-4',
    customerId: '5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw',
    restaurantId: 'rest-1',
    items: [{ dishId: 'dish-2', selectedOptionIds: [] }],
    totalPrice: 1800n,
    status: 'READY_FOR_PICKUP',
    createdAt: Date.now() - 1000 * 60 * 20,
  },
];

const pastOrders: Order[] = [
  {
    id: 'order-5',
    customerId: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    restaurantId: 'rest-1',
    items: [{ dishId: 'dish-1', selectedOptionIds: [] }],
    totalPrice: 1600n,
    status: 'COMPLETED',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    completedAt: Date.now() - 1000 * 60 * 60 * 23,
  },
  {
    id: 'order-6',
    customerId: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    restaurantId: 'rest-1',
    items: [{ dishId: 'dish-3', selectedOptionIds: [] }],
    totalPrice: 900n,
    status: 'CANCELED',
    canceledBy: 'customer',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
];

export const ActiveOrdersByStatus: Story = {
  args: {
    groups: groupOrdersByStatus(mockOrders),
    emptyMessage: 'No active orders',
    onOrderClick: (orderId) => console.log('Clicked:', orderId),
  },
};

export const PastOrdersByDate: Story = {
  args: {
    groups: groupOrdersByDate(pastOrders),
    emptyMessage: 'No past orders',
    onOrderClick: (orderId) => console.log('Clicked:', orderId),
  },
};

export const Empty: Story = {
  args: {
    groups: [],
    emptyMessage: 'No orders yet',
    onOrderClick: () => {},
  },
};

export const EmptyGroups: Story = {
  args: {
    groups: [
      { label: 'new', orders: [] },
      { label: 'confirmed', orders: [] },
    ],
    emptyMessage: 'No orders available',
    onOrderClick: () => {},
  },
};
