import type { Meta, StoryObj } from '@storybook/react';

import { RestaurantOrderCounters } from './RestaurantOrderCounters';

const meta = {
  title: 'Components/RestaurantOrderCounters',
  component: RestaurantOrderCounters,
} satisfies Meta<typeof RestaurantOrderCounters>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    counts: [
      { label: 'new', count: 1 },
      { label: 'confirmed', count: 2 },
      { label: 'preparing', count: 3 },
      { label: 'ready for pickup', count: 2 },
      { label: 'completed', count: 1300 },
      { label: 'canceled', count: 200 },
    ],
  },
};

export const Empty: Story = {
  args: {
    counts: [
      { label: 'new', count: 0 },
      { label: 'confirmed', count: 0 },
      { label: 'preparing', count: 0 },
      { label: 'ready for pickup', count: 0 },
      { label: 'completed', count: 0 },
      { label: 'canceled', count: 0 },
    ],
  },
};
