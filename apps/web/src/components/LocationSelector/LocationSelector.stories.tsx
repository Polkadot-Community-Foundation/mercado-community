import type { Meta, StoryObj } from '@storybook/react';

import { LocationSelector } from './LocationSelector';

const meta = {
  title: 'Components/LocationSelector',
  component: LocationSelector,
} satisfies Meta<typeof LocationSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    locations: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'],
    onSelect: (location: string) => console.log('Selected:', location),
  },
};
