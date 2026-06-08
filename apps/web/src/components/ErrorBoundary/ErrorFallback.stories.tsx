import type { Meta, StoryObj } from '@storybook/react';

import { ErrorFallback } from './ErrorFallback';

const meta: Meta<typeof ErrorFallback> = {
  title: 'Components/ErrorFallback',
  component: ErrorFallback,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onReset: { action: 'reset' },
  },
};

export default meta;
type Story = StoryObj<typeof ErrorFallback>;

const sampleError = new Error('Failed to fetch restaurant data');

export const AppLevel: Story = {
  args: {
    error: sampleError,
    level: 'app',
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export const RouteLevel: Story = {
  args: {
    error: sampleError,
    level: 'route',
  },
};

export const FeatureLevel: Story = {
  args: {
    error: sampleError,
    level: 'feature',
  },
};

export const WithoutReset: Story = {
  args: {
    error: sampleError,
    level: 'route',
    onReset: undefined,
  },
};

export const LongErrorMessage: Story = {
  args: {
    error: new Error(
      'TypeError: Cannot read properties of undefined (reading "map"). This error occurred while trying to render the restaurant list component with invalid data from the API response.',
    ),
    level: 'route',
  },
};
