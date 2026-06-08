import { Navigate } from 'react-router';

import { useAccountInfo } from '../hooks';
import { RestaurantPortalContainer } from '../containers';
import { LoadingSpinner } from '../components';

export function RestaurantPortalPage() {
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
      <h2 className="mb-6 text-2xl font-bold text-text-primary">
        Restaurant portal
      </h2>
      <RestaurantPortalContainer />
    </div>
  );
}
