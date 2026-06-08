import type { ReactNode } from 'react';
import { useLocation } from 'react-router';

import { ErrorBoundary, ErrorFallback } from '../components/ErrorBoundary';

interface RouteErrorBoundaryProps {
  children: ReactNode;
}

/**
 * Error boundary that automatically resets when the route changes.
 * Wrap route content to catch errors and allow recovery via navigation.
 */
export function RouteErrorBoundary({ children }: RouteErrorBoundaryProps) {
  const location = useLocation();

  return (
    <ErrorBoundary
      resetKey={location.pathname}
      fallback={(error, reset) => (
        <ErrorFallback error={error} onReset={reset} level="route" />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
