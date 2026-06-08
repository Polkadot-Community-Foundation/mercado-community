import type { Meta, StoryObj } from '@storybook/react';

import { RateRestaurant } from './RateRestaurant';

const meta = {
  title: 'Components/RateRestaurant',
  component: RateRestaurant,
} satisfies Meta<typeof RateRestaurant>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: (rating) => console.log('Submitted rating:', rating),
  },
};

export const AlreadyRated: Story = {
  args: {
    currentRating: 4,
    onSubmit: (rating) => console.log('Submitted rating:', rating),
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    onSubmit: (rating) => console.log('Submitted rating:', rating),
  },
};
