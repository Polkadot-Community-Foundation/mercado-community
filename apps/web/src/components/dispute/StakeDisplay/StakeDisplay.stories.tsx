import type { Meta, StoryObj } from '@storybook/react';

import { StakeDisplay } from './StakeDisplay';

const meta: Meta<typeof StakeDisplay> = {
  title: 'Components/Dispute/StakeDisplay',
  component: StakeDisplay,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[300px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const InitiatorOnly: Story = {
  args: {
    initiatorStake: 500n,
  },
};

export const BothParties: Story = {
  args: {
    initiatorStake: 500n,
    challengerStake: 500n,
  },
};

export const FaultAccepted: Story = {
  args: {
    initiatorStake: 500n,
    faultAccepted: true,
  },
};

export const Compact: Story = {
  args: {
    initiatorStake: 500n,
    challengerStake: 500n,
    compact: true,
  },
};

export const CompactFaultAccepted: Story = {
  args: {
    initiatorStake: 500n,
    faultAccepted: true,
    compact: true,
  },
};
