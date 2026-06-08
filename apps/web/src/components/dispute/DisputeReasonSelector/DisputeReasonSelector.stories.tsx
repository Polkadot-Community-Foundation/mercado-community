import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { DisputeReason } from '@mercado/types';

import { DisputeReasonSelector } from './DisputeReasonSelector';

const meta: Meta<typeof DisputeReasonSelector> = {
  title: 'Components/Dispute/DisputeReasonSelector',
  component: DisputeReasonSelector,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[400px] p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: null,
    onChange: (reason: DisputeReason) => console.log('Selected:', reason),
  },
};

export const Selected: Story = {
  args: {
    value: 'wrong_items',
    onChange: (reason: DisputeReason) => console.log('Selected:', reason),
  },
};

export const Disabled: Story = {
  args: {
    value: 'wrong_items',
    onChange: (reason: DisputeReason) => console.log('Selected:', reason),
    disabled: true,
  },
};

function InteractiveSelector() {
  const [value, setValue] = useState<DisputeReason | null>(null);
  return <DisputeReasonSelector value={value} onChange={setValue} />;
}

export const Interactive: Story = {
  render: () => <InteractiveSelector />,
};
