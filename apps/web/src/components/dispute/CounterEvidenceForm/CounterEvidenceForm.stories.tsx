import type { Meta, StoryObj } from '@storybook/react';

import {
  CounterEvidenceForm,
  type CounterEvidenceFormData,
} from './CounterEvidenceForm';

const meta: Meta<typeof CounterEvidenceForm> = {
  title: 'Dispute/CounterEvidenceForm',
  component: CounterEvidenceForm,
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
    onSubmit: (data: CounterEvidenceFormData) => console.log('Submit:', data),
    onAcceptFault: () => console.log('Accept Fault'),
    onCancel: () => console.log('Cancel'),
  },
};

export default meta;
type Story = StoryObj<typeof CounterEvidenceForm>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const WithError: Story = {
  args: {
    error: 'Failed to submit counter-evidence. Please try again.',
  },
};
