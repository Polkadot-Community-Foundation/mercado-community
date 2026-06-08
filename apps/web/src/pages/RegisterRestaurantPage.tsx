import { Navigate } from 'react-router';

import { useAccountInfo } from '../hooks';
import { RegisterRestaurantContainer } from '../containers/RegisterRestaurantContainer';
import { LoadingSpinner } from '../components';

export function RegisterRestaurantPage() {
  const { account, restaurantId, isLoading } = useAccountInfo();

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

  if (restaurantId !== null) {
    return <Navigate to="/restaurant-portal" replace />;
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-8">
      <h2 className="mb-6 text-2xl font-bold text-text-primary">
        Join as a restaurant
      </h2>
      <RegisterRestaurantContainer />
    </div>
  );
}
