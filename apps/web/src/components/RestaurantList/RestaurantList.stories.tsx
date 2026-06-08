import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router';

import { RestaurantList } from './RestaurantList';

const meta = {
  title: 'Components/RestaurantList',
  component: RestaurantList,
  decorators: [
    (Story: React.ComponentType) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof RestaurantList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithRestaurants: Story = {
  args: {
    restaurants: [
      {
        id: '1',
        name: 'Burger Palace',
        description: 'The best burgers in town.',
        isOpen: true,
        ratingSum: 940,
        ratingCount: 200,
      },
      {
        id: '2',
        name: 'Pizza Corner',
        description: 'Authentic Neapolitan pizza.',
        isOpen: true,
        ratingSum: 450,
        ratingCount: 100,
      },
      {
        id: '3',
        name: 'Sushi Express',
        description: 'Fresh sushi and sashimi.',
        isOpen: false,
        ratingSum: 480,
        ratingCount: 100,
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    restaurants: [],
  },
};
