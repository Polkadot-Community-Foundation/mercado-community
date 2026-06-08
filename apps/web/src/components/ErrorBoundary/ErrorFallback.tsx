import type { FC } from 'react';

export interface ErrorFallbackProps {
  error: Error;
  onReset?: () => void;
  level: 'app' | 'route' | 'feature';
}

/**
 * Presentational component for displaying error states.
 * Styling varies based on the level (app, route, or feature).
 */
export const ErrorFallback: FC<ErrorFallbackProps> = ({
  error,
  onReset,
  level,
}) => {
  if (level === 'app') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background-primary p-6">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold text-text-primary">
            Something went wrong
          </h1>
          <p className="mb-6 text-text-secondary">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <pre className="mb-6 max-h-32 overflow-auto rounded bg-background-secondary p-3 text-left text-xs text-text-tertiary">
            {error.message}
          </pre>
          {onReset && (
            <button
              onClick={onReset}
              className="rounded-lg bg-brand-primary px-6 py-2 font-medium text-white hover:bg-brand-primary/90"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (level === 'route') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="max-w-md rounded-lg border border-border-primary bg-background-secondary p-6 text-center">
          <h2 className="mb-3 text-xl font-semibold text-text-primary">
            Page Error
          </h2>
          <p className="mb-4 text-sm text-text-secondary">
            This page encountered an error. You can try again or navigate to a
            different page.
          </p>
          <pre className="mb-4 max-h-24 overflow-auto rounded bg-background-primary p-2 text-left text-xs text-text-tertiary">
            {error.message}
          </pre>
          {onReset && (
            <button
              onClick={onReset}
              className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary/90"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  // feature level - inline/compact
  return (
    <div className="rounded border border-status-error/20 bg-status-error/5 p-3">
      <p className="mb-2 text-sm font-medium text-status-error">
        Failed to load
      </p>
      <p className="mb-2 text-xs text-text-tertiary">{error.message}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="text-xs font-medium text-brand-primary hover:underline"
        >
          Retry
        </button>
      )}
    </div>
  );
};
