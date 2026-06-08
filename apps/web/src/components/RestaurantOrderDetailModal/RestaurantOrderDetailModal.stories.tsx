import type { Meta, StoryObj } from '@storybook/react';
import { dishes, dishOptions } from '@mercado/mocks';
import type { Order, OrderStatus } from '@mercado/types';

import { RestaurantOrderDetailModal } from './RestaurantOrderDetailModal';

const resolvedItems = [
  {
    dishId: dishes.dishBaconDeluxe.id,
    dishName: dishes.dishBaconDeluxe.name,
    dishDescription: dishes.dishBaconDeluxe.description,
    basePrice: dishes.dishBaconDeluxe.basePrice,
    selectedOptions: [
      dishOptions.optionNoBacon,
      dishOptions.optionExtraBurgerPatty,
    ],
    itemTotal: 1800n,
  },
];

function makeOrder(status: OrderStatus, extra?: Partial<Order>): Order {
  return {
    id: 'order-1',
    customerId: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    restaurantId: '1',
    items: [{ dishId: 'd2', selectedOptionIds: ['o8', 'o9'] }],
    totalPrice: 1800n,
    status,
    createdAt: Date.now(),
    ...extra,
  };
}

const meta = {
  title: 'Components/RestaurantOrderDetailModal',
  component: RestaurantOrderDetailModal,
} satisfies Meta<typeof RestaurantOrderDetailModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Placed: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    order: makeOrder('PLACED'),
    customerAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    resolvedItems,
    advanceLabel: 'Confirm order',
    onAdvance: () => {},
    onCancel: () => {},
  },
};

export const Confirmed: Story = {
  args: {
    ...Placed.args,
    order: makeOrder('CONFIRMED'),
    advanceLabel: 'Preparing order',
  },
};

export const Preparing: Story = {
  args: {
    ...Placed.args,
    order: makeOrder('PREPARING'),
    advanceLabel: 'Order is ready for pickup',
  },
};

export const Completed: Story = {
  args: {
    ...Placed.args,
    order: makeOrder('COMPLETED'),
    advanceLabel: undefined,
    onAdvance: undefined,
    onCancel: undefined,
  },
};

export const CanceledByCustomer: Story = {
  args: {
    ...Placed.args,
    order: makeOrder('CANCELED', { canceledBy: 'customer' }),
    advanceLabel: undefined,
    onAdvance: undefined,
    onCancel: undefined,
  },
};

export const CanceledByRestaurant: Story = {
  args: {
    ...Placed.args,
    order: makeOrder('CANCELED', { canceledBy: 'restaurant' }),
    advanceLabel: undefined,
    onAdvance: undefined,
    onCancel: undefined,
  },
};
