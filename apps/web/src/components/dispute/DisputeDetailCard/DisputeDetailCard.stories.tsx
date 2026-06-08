import type { Meta, StoryObj } from '@storybook/react';
import {
  DisputeStatus,
  Verdict,
  type Dispute,
  type DisputeEvidence,
  type Restaurant,
} from '@mercado/types';

import { DisputeDetailCard } from './DisputeDetailCard';

const meta: Meta<typeof DisputeDetailCard> = {
  title: 'Components/Dispute/DisputeDetailCard',
  component: DisputeDetailCard,
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
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockRestaurant: Restaurant = {
  id: 'restaurant-1',
  name: 'Burger Palace',
  owner: '0x1234567890',
  location: 'New York',
  description: 'Best burgers in town',
  category: 'burgers',
  isOpen: true,
  ratingSum: 400,
  ratingCount: 100,
  dishes: [],
};

const openDispute: Dispute = {
  id: 'dispute-abc123',
  orderId: 'order-xyz789',
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

const initiatorEvidence: DisputeEvidence = {
  version: '1.0',
  title: 'Missing items in order',
  description:
    'I ordered a burger with fries but only received the burger. The fries were missing from my order.',
  photos: ['https://example.com/photo1.jpg'],
  submittedBy: 'customer',
  timestamp: Date.now() - 1000 * 60 * 60 * 2,
};

const counterEvidence: DisputeEvidence = {
  version: '1.0',
  title: 'Order was complete',
  description:
    'Our records show the order was complete. The fries were included in the bag.',
  photos: ['https://example.com/photo2.jpg'],
  submittedBy: 'restaurant',
  timestamp: Date.now() - 1000 * 60 * 60,
};

export const OpenAsCustomer: Story = {
  args: {
    dispute: openDispute,
    restaurant: mockRestaurant,
    initiatorEvidence,
    isRestaurantOwner: false,
    isCustomer: true,
    canRespond: false,
  },
};

export const OpenAsRestaurantCanRespond: Story = {
  args: {
    dispute: openDispute,
    restaurant: mockRestaurant,
    initiatorEvidence,
    isRestaurantOwner: true,
    isCustomer: false,
    canRespond: true,
    onRespond: () => console.log('Respond clicked'),
  },
};

export const WithCounterEvidence: Story = {
  args: {
    dispute: {
      ...openDispute,
      counterEvidenceCID: 'bafkrei2',
      challengerStake: 500n,
    },
    restaurant: mockRestaurant,
    initiatorEvidence,
    counterEvidence,
    isRestaurantOwner: false,
    isCustomer: true,
    canRespond: false,
  },
};

export const Resolved: Story = {
  args: {
    dispute: {
      ...openDispute,
      status: DisputeStatus.RESOLVED,
      verdict: Verdict.CustomerWins,
      counterEvidenceCID: 'bafkrei2',
      challengerStake: 500n,
      resolvedAt: Date.now() - 1000 * 60 * 60,
    },
    restaurant: mockRestaurant,
    initiatorEvidence,
    counterEvidence,
    isRestaurantOwner: false,
    isCustomer: true,
    canRespond: false,
  },
};

export const NoEvidenceData: Story = {
  args: {
    dispute: openDispute,
    restaurant: mockRestaurant,
    initiatorEvidence: undefined,
    isRestaurantOwner: false,
    isCustomer: true,
    canRespond: false,
  },
};
