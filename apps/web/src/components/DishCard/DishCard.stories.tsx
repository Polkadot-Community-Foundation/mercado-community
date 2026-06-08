import type { Meta, StoryObj } from '@storybook/react';
import { dishes } from '@mercado/mocks';

import { DishCard } from './DishCard';

const meta = {
  title: 'Components/DishCard',
  component: DishCard,
} satisfies Meta<typeof DishCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InStock: Story = {
  args: dishes.dishClassicBurger,
};

export const OutOfStock: Story = {
  args: dishes.dishVeggieBurger,
};

export const NoImage: Story = {
  args: { ...dishes.dishClassicBurger, photoUrl: undefined },
};
