import type { Meta, StoryObj } from '@storybook/react';
import { dishes } from '@mercado/mocks';

import { DishList } from './DishList';

const meta = {
  title: 'Components/DishList',
  component: DishList,
} satisfies Meta<typeof DishList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDishes: Story = {
  args: {
    dishes: [
      dishes.dishClassicBurger,
      dishes.dishBaconDeluxe,
      dishes.dishVeggieBurger,
    ],
  },
};

export const Empty: Story = {
  args: {
    dishes: [],
  },
};

export const MixedImages: Story = {
  args: {
    dishes: [
      dishes.dishClassicBurger,
      { ...dishes.dishBaconDeluxe, photoUrl: undefined },
      dishes.dishVeggieBurger,
    ],
  },
};
