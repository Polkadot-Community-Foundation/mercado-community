import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { ErrorBoundary } from './ErrorBoundary';
import { ErrorFallback } from './ErrorFallback';

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Components/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

// Component that throws an error
function BrokenComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('This component crashed intentionally');
  }
  return (
    <div className="rounded-lg border border-border-primary bg-background-secondary p-4">
      <p className="text-text-primary">Component loaded successfully</p>
    </div>
  );
}

// Interactive demo that can trigger errors
function InteractiveDemo() {
  const [shouldThrow, setShouldThrow] = useState(false);
  const [key, setKey] = useState(0);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setShouldThrow(true)}
          className="rounded bg-status-error px-3 py-1 text-sm text-white"
        >
          Trigger Error
        </button>
        <button
          onClick={() => {
            setShouldThrow(false);
            setKey((k) => k + 1);
          }}
          className="rounded bg-brand-primary px-3 py-1 text-sm text-white"
        >
          Reset
        </button>
      </div>
      <ErrorBoundary
        key={key}
        fallback={(error, reset) => (
          <ErrorFallback error={error} onReset={reset} level="feature" />
        )}
      >
        <BrokenComponent shouldThrow={shouldThrow} />
      </ErrorBoundary>
    </div>
  );
}

export const Default: Story = {
  render: () => <InteractiveDemo />,
};

export const WithCustomFallback: Story = {
  args: {
    fallback: (
      <div className="rounded border-2 border-dashed border-status-error p-4 text-center">
        <p className="text-status-error">Custom fallback UI</p>
      </div>
    ),
    children: <BrokenComponent shouldThrow />,
  },
};

export const WithFunctionFallback: Story = {
  args: {
    fallback: (error, reset) => (
      <div className="space-y-2 rounded bg-background-secondary p-4">
        <p className="text-sm text-status-error">Error: {error.message}</p>
        <button
          onClick={reset}
          className="rounded bg-brand-primary px-3 py-1 text-sm text-white"
        >
          Reset boundary
        </button>
      </div>
    ),
    children: <BrokenComponent shouldThrow />,
  },
};
