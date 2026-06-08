import type { Meta, StoryObj } from '@storybook/react';

import {
  RegisterRestaurantForm,
  type RegisterRestaurantFormData,
} from './RegisterRestaurantForm';

const meta: Meta<typeof RegisterRestaurantForm> = {
  title: 'Components/RegisterRestaurantForm',
  component: RegisterRestaurantForm,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[480px] p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          Join as a restaurant
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
    locations: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'],
    onSubmit: (data: RegisterRestaurantFormData) =>
      console.log('Submitted:', data),
  },
};

export const Loading: Story = {
  args: {
    locations: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'],
    onSubmit: (data: RegisterRestaurantFormData) =>
      console.log('Submitted:', data),
    isLoading: true,
  },
};

export const WithError: Story = {
  args: {
    locations: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'],
    onSubmit: (data: RegisterRestaurantFormData) =>
      console.log('Submitted:', data),
    error: 'Account already owns a restaurant',
  },
};
