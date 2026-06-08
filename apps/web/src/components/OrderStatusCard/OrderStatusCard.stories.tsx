import type { Meta, StoryObj } from '@storybook/react';
import { dishes, dishOptions } from '@mercado/mocks';
import type { Order, OrderStatus } from '@mercado/types';

import { OrderStatusCard } from './OrderStatusCard';

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
  title: 'Components/OrderStatusCard',
  component: OrderStatusCard,
} satisfies Meta<typeof OrderStatusCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Placed: Story = {
  args: {
    order: makeOrder('PLACED'),
    restaurantName: 'Burger Palace',
    resolvedItems,
    onCancel: () => {},
  },
};

export const Confirmed: Story = {
  args: {
    order: makeOrder('CONFIRMED'),
    restaurantName: 'Burger Palace',
    resolvedItems,
    onCancel: () => {},
  },
};

export const Preparing: Story = {
  args: {
    order: makeOrder('PREPARING'),
    restaurantName: 'Burger Palace',
    resolvedItems,
    onCancel: () => {},
  },
};

export const ReadyForPickup: Story = {
  args: {
    order: makeOrder('READY_FOR_PICKUP'),
    restaurantName: 'Burger Palace',
    resolvedItems,
    onPickedUp: () => {},
  },
};

export const Completed: Story = {
  args: {
    order: makeOrder('COMPLETED', { completedAt: Date.now() }),
    restaurantName: 'Burger Palace',
    resolvedItems,
    canRaiseDispute: true,
    onRaiseDispute: () => {},
  },
};

export const CompletedWindowExpired: Story = {
  args: {
    order: makeOrder('COMPLETED', {
      completedAt: Date.now() - 25 * 60 * 60 * 1000,
    }),
    restaurantName: 'Burger Palace',
    resolvedItems,
    canRaiseDispute: false,
    disputeUnavailableReason: 'window_expired',
  },
};

export const CompletedAlreadyDisputed: Story = {
  args: {
    order: makeOrder('COMPLETED', {
      completedAt: Date.now(),
      disputeId: 'dispute-1',
    }),
    restaurantName: 'Burger Palace',
    resolvedItems,
    canRaiseDispute: false,
    disputeUnavailableReason: 'already_disputed',
  },
};

export const Canceled: Story = {
  args: {
    order: makeOrder('CANCELED', { canceledBy: 'restaurant' }),
    restaurantName: 'Burger Palace',
    resolvedItems,
  },
};

export const Loading: Story = {
  args: {
    order: undefined,
    restaurantName: 'Burger Palace',
    resolvedItems: [],
    isLoading: true,
  },
};

export const NotFound: Story = {
  args: {
    order: undefined,
    restaurantName: 'Burger Palace',
    resolvedItems: [],
  },
};

export const DisputeForm: Story = {
  args: {
    order: makeOrder('COMPLETED', { completedAt: Date.now() }),
    restaurantName: 'Burger Palace',
    resolvedItems,
    showDisputeForm: true,
    onBackFromDispute: () => {},
    disputeFormContent: (
      <div className="p-4 bg-gray-100 rounded">Dispute form placeholder</div>
    ),
  },
};
