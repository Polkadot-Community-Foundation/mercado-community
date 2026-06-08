import type { Meta, StoryObj } from '@storybook/react';
import { DisputeStatus, Verdict } from '@mercado/types';

import { DisputeStatusBadge } from './DisputeStatusBadge';

const meta: Meta<typeof DisputeStatusBadge> = {
  title: 'Components/Dispute/DisputeStatusBadge',
  component: DisputeStatusBadge,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    status: DisputeStatus.OPEN,
    verdict: Verdict.Pending,
  },
};

export const CustomerWins: Story = {
  args: {
    status: DisputeStatus.RESOLVED,
    verdict: Verdict.CustomerWins,
  },
};

export const RestaurantWins: Story = {
  args: {
    status: DisputeStatus.RESOLVED,
    verdict: Verdict.RestaurantWins,
  },
};

export const SmallOpen: Story = {
  args: {
    status: DisputeStatus.OPEN,
    verdict: Verdict.Pending,
    size: 'sm',
  },
};

export const SmallResolved: Story = {
  args: {
    status: DisputeStatus.RESOLVED,
    verdict: Verdict.CustomerWins,
    size: 'sm',
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-2 items-start">
      <DisputeStatusBadge
        status={DisputeStatus.OPEN}
        verdict={Verdict.Pending}
      />
      <DisputeStatusBadge
        status={DisputeStatus.RESOLVED}
        verdict={Verdict.CustomerWins}
      />
      <DisputeStatusBadge
        status={DisputeStatus.RESOLVED}
        verdict={Verdict.RestaurantWins}
      />
    </div>
  ),
};
