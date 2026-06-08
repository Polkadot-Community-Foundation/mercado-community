import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router';

import { CartBadge } from './CartBadge';

const meta = {
  title: 'Components/CartBadge',
  component: CartBadge,
  decorators: [
    (Story: React.ComponentType) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof CartBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithCount: Story = {
  args: { count: 3 },
};

export const Empty: Story = {
  args: { count: 0 },
};
