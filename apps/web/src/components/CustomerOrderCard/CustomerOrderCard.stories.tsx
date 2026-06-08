import type { Meta, StoryObj } from '@storybook/react';

import { CustomerOrderCard } from './CustomerOrderCard';

const meta = {
  title: 'Components/CustomerOrderCard',
  component: CustomerOrderCard,
} satisfies Meta<typeof CustomerOrderCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Placed: Story = {
  args: {
    restaurantName: 'Burger Palace',
    totalPrice: 1800n,
    status: 'PLACED',
    itemCount: 2,
    onClick: () => {},
  },
};

export const Confirmed: Story = {
  args: {
    ...Placed.args,
    status: 'CONFIRMED',
  },
};

export const Preparing: Story = {
  args: {
    ...Placed.args,
    status: 'PREPARING',
  },
};

export const ReadyForPickup: Story = {
  args: {
    ...Placed.args,
    status: 'READY_FOR_PICKUP',
  },
};

export const Completed: Story = {
  args: {
    ...Placed.args,
    status: 'COMPLETED',
  },
};

export const CanceledByCustomer: Story = {
  args: {
    ...Placed.args,
    status: 'CANCELED',
    canceledBy: 'customer',
  },
};

export const CanceledByRestaurant: Story = {
  args: {
    ...Placed.args,
    status: 'CANCELED',
    canceledBy: 'restaurant',
  },
};
