import type { Meta, StoryObj } from '@storybook/react';

import { RestaurantOrderCard } from './RestaurantOrderCard';

const meta = {
  title: 'Components/RestaurantOrderCard',
  component: RestaurantOrderCard,
} satisfies Meta<typeof RestaurantOrderCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const New: Story = {
  args: {
    orderId: 'order-abc123',
    customerAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    totalPrice: 1800n,
    status: 'PLACED',
    itemCount: 2,
    onClick: () => {},
  },
};

export const Confirmed: Story = {
  args: {
    ...New.args,
    status: 'CONFIRMED',
  },
};

export const Preparing: Story = {
  args: {
    ...New.args,
    status: 'PREPARING',
  },
};

export const ReadyForPickup: Story = {
  args: {
    ...New.args,
    status: 'READY_FOR_PICKUP',
  },
};

export const Completed: Story = {
  args: {
    ...New.args,
    status: 'COMPLETED',
  },
};

export const CanceledByCustomer: Story = {
  args: {
    ...New.args,
    status: 'CANCELED',
    canceledBy: 'customer',
  },
};

export const CanceledByRestaurant: Story = {
  args: {
    ...New.args,
    status: 'CANCELED',
    canceledBy: 'restaurant',
  },
};
