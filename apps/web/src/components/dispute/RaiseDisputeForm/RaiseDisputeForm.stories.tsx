import type { Meta, StoryObj } from '@storybook/react';

import {
  RaiseDisputeForm,
  type RaiseDisputeFormData,
} from './RaiseDisputeForm';

const meta: Meta<typeof RaiseDisputeForm> = {
  title: 'Dispute/RaiseDisputeForm',
  component: RaiseDisputeForm,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
  args: {
    stakeAmount: 500n,
    onSubmit: (data: RaiseDisputeFormData) => console.log('Submit:', data),
    onCancel: () => console.log('Cancel'),
  },
};

export default meta;
type Story = StoryObj<typeof RaiseDisputeForm>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const WithError: Story = {
  args: {
    error: 'Failed to submit dispute. Please try again.',
  },
};
