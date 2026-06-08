import type { Meta, StoryObj } from '@storybook/react';
import type { Dish } from '@mercado/types';

import { MenuEditor, type MenuEditorDish } from './MenuEditor';

const meta: Meta<typeof MenuEditor> = {
  title: 'Components/MenuEditor',
  component: MenuEditor,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl mx-auto">
        <Story />
      </div>
    ),
  ],
  args: {
    onSave: (dishes: Dish[]) => console.log('Saved dishes:', dishes),
  },
};

export default meta;
type Story = StoryObj<typeof MenuEditor>;

export const Empty: Story = {};

const sampleDishes: MenuEditorDish[] = [
  {
    id: 'dish-1',
    name: 'Classic Burger',
    description: 'Juicy beef patty with lettuce, tomato, and special sauce',
    basePrice: '0.5',
    inStock: true,
    options: [
      { id: 'opt-1', name: 'Extra cheese', price: '0.05' },
      { id: 'opt-2', name: 'Bacon', price: '0.1' },
    ],
  },
  {
    id: 'dish-2',
    name: 'Veggie Burger',
    description: 'Plant-based patty with fresh vegetables',
    basePrice: '0.45',
    inStock: true,
    options: [],
  },
  {
    id: 'dish-3',
    name: 'Fries',
    description: 'Crispy golden fries',
    basePrice: '0.2',
    inStock: false,
    options: [{ id: 'opt-3', name: 'Large', price: '0.1' }],
  },
];

export const WithDishes: Story = {
  args: {
    initialDishes: sampleDishes,
  },
};

export const Loading: Story = {
  args: {
    initialDishes: sampleDishes,
    isLoading: true,
  },
};

export const WithError: Story = {
  args: {
    initialDishes: sampleDishes,
    error: 'Failed to save menu. Please try again.',
  },
};
