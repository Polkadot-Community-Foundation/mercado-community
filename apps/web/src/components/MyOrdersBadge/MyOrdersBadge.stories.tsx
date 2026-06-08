import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router';

import { MyOrdersBadge } from './MyOrdersBadge';

const meta = {
  title: 'Components/MyOrdersBadge',
  component: MyOrdersBadge,
  decorators: [
    (Story: React.ComponentType) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof MyOrdersBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoActiveOrders: Story = {
  args: {
    activeCount: 0,
  },
};

export const WithActiveOrders: Story = {
  args: {
    activeCount: 3,
  },
};
