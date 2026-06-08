import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router';

import { AppShell } from './AppShell';

const meta: Meta<typeof AppShell> = {
  title: 'Components/AppShell',
  component: AppShell,
  decorators: [
    (Story: React.ComponentType) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Customer: Story = {
  args: {
    isLanding: true,
    cartItemCount: 0,
    isCustomer: true,
    isAuthenticated: true,
    activeOrderCount: 0,
  },
};

export const CustomerWithOrders: Story = {
  args: {
    isLanding: false,
    cartItemCount: 3,
    isCustomer: true,
    isAuthenticated: true,
    activeOrderCount: 2,
  },
};

export const RestaurantOwner: Story = {
  args: {
    isLanding: true,
    cartItemCount: 0,
    isCustomer: false,
    isAuthenticated: true,
    activeOrderCount: 0,
  },
};

export const Unauthenticated: Story = {
  args: {
    isLanding: true,
    cartItemCount: 0,
    isCustomer: true,
    isAuthenticated: false,
    activeOrderCount: 0,
  },
};
