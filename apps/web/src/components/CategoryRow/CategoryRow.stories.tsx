import type { Meta, StoryObj } from '@storybook/react';

import { CategoryRow } from './CategoryRow';

const meta: Meta<typeof CategoryRow> = {
  component: CategoryRow,
  title: 'Components/CategoryRow',
};

export default meta;
type Story = StoryObj<typeof CategoryRow>;

export const Default: Story = {};

export const WithSelection: Story = {
  args: {
    selected: 'pizza',
  },
};
