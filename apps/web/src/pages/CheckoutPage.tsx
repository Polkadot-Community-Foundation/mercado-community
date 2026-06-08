import { Navigate } from 'react-router';

import { useAccountInfo } from '../hooks';
import { CheckoutContainer } from '../containers';
import { LoadingSpinner } from '../components';

export function CheckoutPage() {
  const { account, isLoading } = useAccountInfo();

  // Wait for auth to complete before redirecting
  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <LoadingSpinner />
        <p className="mt-2 text-text-secondary">Loading...</p>
      </div>
    );
  }

  if (!account) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-8">
      <CheckoutContainer />
    </div>
  );
}
