import type { Meta, StoryObj } from '@storybook/react';
import { dishes } from '@mercado/mocks';

import { DishOptionModal } from './DishOptionModal';

const meta = {
  title: 'Components/DishOptionModal',
  component: DishOptionModal,
} satisfies Meta<typeof DishOptionModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithOptions: Story = {
  args: {
    dish: dishes.dishBaconDeluxe,
    isOpen: true,
    isAuthenticated: true,
    onClose: () => {},
    onAddToCart: () => {},
  },
};

export const NoOptions: Story = {
  args: {
    dish: dishes.dishPepperoni,
    isOpen: true,
    isAuthenticated: true,
    onClose: () => {},
    onAddToCart: () => {},
  },
};

export const Unauthenticated: Story = {
  args: {
    dish: dishes.dishBaconDeluxe,
    isOpen: true,
    isAuthenticated: false,
    onClose: () => {},
    onAddToCart: () => {},
  },
};
