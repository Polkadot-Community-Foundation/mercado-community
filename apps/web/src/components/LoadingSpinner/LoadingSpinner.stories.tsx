import type { Meta, StoryObj } from '@storybook/react';

import { LoadingSpinner } from './LoadingSpinner';

const meta: Meta<typeof LoadingSpinner> = {
  title: 'Components/LoadingSpinner',
  component: LoadingSpinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LoadingSpinner>;

export const Default: Story = {};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const WhiteVariant: Story = {
  args: {
    variant: 'white',
  },
  decorators: [
    (Story) => (
      <div className="bg-brand p-8 rounded-lg">
        <Story />
      </div>
    ),
  ],
};
