import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router';

import { RestaurantCard } from './RestaurantCard';

const meta = {
  title: 'Components/RestaurantCard',
  component: RestaurantCard,
  decorators: [
    (Story: React.ComponentType) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof RestaurantCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    id: '1',
    name: 'Burger Palace',
    description: 'The best burgers in town, made with 100% grass-fed beef.',
    isOpen: true,
    ratingSum: 940,
    ratingCount: 200,
  },
};

export const Closed: Story = {
  args: {
    id: '2',
    name: 'Sushi Express',
    description: 'Fresh sushi and sashimi prepared by master chefs.',
    isOpen: false,
    ratingSum: 480,
    ratingCount: 100,
  },
};
