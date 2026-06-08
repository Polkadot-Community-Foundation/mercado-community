import { Navigate } from 'react-router';

import { useAccountInfo } from '../hooks';
import { MyOrdersContainer } from '../containers';
import { LoadingSpinner } from '../components';

export function MyOrdersPage() {
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
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h2 className="mb-6 text-2xl font-bold text-text-primary">My orders</h2>
      <MyOrdersContainer />
    </div>
  );
}
