import type { Meta, StoryObj } from '@storybook/react';
import type { DisputeEvidence } from '@mercado/types';

import { EvidenceDisplay } from './EvidenceDisplay';

const meta: Meta<typeof EvidenceDisplay> = {
  title: 'Components/Dispute/EvidenceDisplay',
  component: EvidenceDisplay,
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

const customerEvidence: DisputeEvidence = {
  version: '1.0',
  title: 'Received wrong burger',
  description:
    'I ordered a veggie burger but received a beef burger instead. This is unacceptable as I am vegetarian.',
  disputeType: 'wrong_items',
  photos: ['bafkrei1', 'bafkrei2'],
  submittedBy: 'customer',
  timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
};

const restaurantEvidence: DisputeEvidence = {
  version: '1.0',
  title: 'Order was prepared correctly',
  description:
    'We have reviewed the order and it was prepared exactly as requested. The ticket clearly shows a veggie burger was prepared. Please see the attached photo of the preparation area.',
  photos: ['bafkrei3'],
  submittedBy: 'restaurant',
  timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
};

const evidenceNoPhotos: DisputeEvidence = {
  version: '1.0',
  title: 'Food arrived cold',
  description: 'The food arrived completely cold and inedible.',
  disputeType: 'food_quality',
  submittedBy: 'customer',
  timestamp: Date.now(),
};

export const CustomerEvidence: Story = {
  args: {
    evidence: customerEvidence,
    title: 'Customer Evidence',
  },
};

export const RestaurantEvidence: Story = {
  args: {
    evidence: restaurantEvidence,
    title: 'Restaurant Response',
  },
};

export const NoPhotos: Story = {
  args: {
    evidence: evidenceNoPhotos,
  },
};

export const SideBySide: Story = {
  render: () => (
    <div className="flex gap-4 w-[800px]">
      <div className="flex-1">
        <EvidenceDisplay
          evidence={customerEvidence}
          title="Customer Evidence"
        />
      </div>
      <div className="flex-1">
        <EvidenceDisplay
          evidence={restaurantEvidence}
          title="Restaurant Response"
        />
      </div>
    </div>
  ),
};
