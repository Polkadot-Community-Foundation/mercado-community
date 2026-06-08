import type { Meta, StoryObj } from '@storybook/react';
import { dishes, dishOptions } from '@mercado/mocks';

import { CartSummary } from './CartSummary';

const meta = {
  title: 'Components/CartSummary',
  component: CartSummary,
} satisfies Meta<typeof CartSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithItems: Story = {
  args: {
    items: [
      {
        dishId: dishes.dishBaconDeluxe.id,
        dishName: dishes.dishBaconDeluxe.name,
        dishDescription: dishes.dishBaconDeluxe.description,
        basePrice: dishes.dishBaconDeluxe.basePrice,
        selectedOptions: [
          dishOptions.optionNoBacon,
          dishOptions.optionExtraBurgerPatty,
        ],
        itemTotal: 1800n,
      },
    ],
    subtotal: 1800n,
    feeAmount: 90n,
    feePercentage: 500, // 5%
    total: 1890n,
    restaurantName: 'Burger Palace',
    onConfirm: () => {},
  },
};

export const NoFee: Story = {
  args: {
    items: [
      {
        dishId: dishes.dishBaconDeluxe.id,
        dishName: dishes.dishBaconDeluxe.name,
        dishDescription: dishes.dishBaconDeluxe.description,
        basePrice: dishes.dishBaconDeluxe.basePrice,
        selectedOptions: [],
        itemTotal: 1500n,
      },
    ],
    subtotal: 1500n,
    total: 1500n,
    restaurantName: 'Burger Palace',
    onConfirm: () => {},
  },
};
