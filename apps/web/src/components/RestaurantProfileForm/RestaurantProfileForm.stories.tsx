import type { Meta, StoryObj } from '@storybook/react';

import {
  RestaurantProfileForm,
  type RestaurantProfileFormData,
} from './RestaurantProfileForm';

const meta: Meta<typeof RestaurantProfileForm> = {
  title: 'Components/RestaurantProfileForm',
  component: RestaurantProfileForm,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[480px] p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-text-primary mb-6">
          Edit Profile
        </h2>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    initialDescription:
      'A cozy Italian restaurant serving authentic pasta dishes.',
    onSave: (data: RestaurantProfileFormData) => console.log('Saved:', data),
    onCancel: () => console.log('Cancelled'),
  },
};

export const WithExistingAvatar: Story = {
  args: {
    initialDescription: 'Best burgers in town!',
    initialAvatarUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop',
    onSave: (data: RestaurantProfileFormData) => console.log('Saved:', data),
    onCancel: () => console.log('Cancelled'),
  },
};

export const Loading: Story = {
  args: {
    initialDescription: 'Fresh sushi daily.',
    onSave: (data: RestaurantProfileFormData) => console.log('Saved:', data),
    onCancel: () => console.log('Cancelled'),
    isLoading: true,
  },
};

export const WithError: Story = {
  args: {
    initialDescription: 'Thai cuisine at its finest.',
    onSave: (data: RestaurantProfileFormData) => console.log('Saved:', data),
    onCancel: () => console.log('Cancelled'),
    error: 'Failed to update profile. Please try again.',
  },
};

export const Empty: Story = {
  args: {
    onSave: (data: RestaurantProfileFormData) => console.log('Saved:', data),
    onCancel: () => console.log('Cancelled'),
  },
};
