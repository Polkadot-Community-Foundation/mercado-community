import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router';
import { restaurants } from '@mercado/mocks';

import { RestaurantDetail } from './RestaurantDetail';

const meta: Meta<typeof RestaurantDetail> = {
  title: 'Components/RestaurantDetail',
  component: RestaurantDetail,
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

export const WithCheckout: Story = {
  args: {
    restaurant: restaurants.restaurantBurgerPalace,
    showCheckout: true,
    cartItemCount: 3,
    onDishClick: () => {},
  },
};

export const NoCheckout: Story = {
  args: {
    restaurant: restaurants.restaurantBurgerPalace,
    showCheckout: false,
    cartItemCount: 0,
    onDishClick: () => {},
  },
};
