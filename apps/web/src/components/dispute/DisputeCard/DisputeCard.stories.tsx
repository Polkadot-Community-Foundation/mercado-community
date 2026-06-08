import type { Meta, StoryObj } from '@storybook/react';
import { DisputeStatus, Verdict, type Dispute } from '@mercado/types';

import { DisputeCard } from './DisputeCard';

const meta: Meta<typeof DisputeCard> = {
  title: 'Components/Dispute/DisputeCard',
  component: DisputeCard,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const openDispute: Dispute = {
  id: 'dispute-1',
  orderId: 'order-abc123',
  customerId: 'customer-1',
  restaurantId: 'restaurant-1',
  status: DisputeStatus.OPEN,
  verdict: Verdict.Pending,
  initiatorEvidenceCID: 'bafkrei1',
  initiatorStake: 500n,
  challengerStake: 0n,
  faultAccepted: false,
  initiator: 'customer',
  createdAt: Date.now() - 1000 * 60 * 60 * 2,
};

const underReviewDispute: Dispute = {
  ...openDispute,
  id: 'dispute-2',
  counterEvidenceCID: 'bafkrei2',
  challengerStake: 500n,
};

const customerWinsDispute: Dispute = {
  ...openDispute,
  id: 'dispute-3',
  status: DisputeStatus.RESOLVED,
  verdict: Verdict.CustomerWins,
  counterEvidenceCID: 'bafkrei2',
  challengerStake: 500n,
  resolvedAt: Date.now() - 1000 * 60 * 60,
};

const faultAcceptedDispute: Dispute = {
  ...openDispute,
  id: 'dispute-4',
  status: DisputeStatus.RESOLVED,
  verdict: Verdict.CustomerWins,
  faultAccepted: true,
  resolvedAt: Date.now() - 1000 * 60 * 60,
};

export const Open: Story = {
  args: {
    dispute: openDispute,
    restaurantName: 'Burger Palace',
    onViewDetails: () => console.log('View details'),
  },
};

export const UnderReview: Story = {
  args: {
    dispute: underReviewDispute,
    restaurantName: 'Burger Palace',
    onViewDetails: () => console.log('View details'),
  },
};

export const CustomerWins: Story = {
  args: {
    dispute: customerWinsDispute,
    restaurantName: 'Burger Palace',
    onViewDetails: () => console.log('View details'),
  },
};

export const FaultAccepted: Story = {
  args: {
    dispute: faultAcceptedDispute,
    restaurantName: 'Burger Palace',
    onViewDetails: () => console.log('View details'),
  },
};

export const WithActions: Story = {
  args: {
    dispute: openDispute,
    restaurantName: 'Burger Palace',
    showActions: true,
    onViewDetails: () => console.log('View details'),
    onRespond: () => console.log('Respond'),
    onAcceptFault: () => console.log('Accept fault'),
  },
};
