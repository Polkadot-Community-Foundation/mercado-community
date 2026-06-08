import { Navigate } from 'react-router';

import { useAccountInfo } from '../hooks';
import { MenuEditorContainer } from '../containers/MenuEditorContainer';
import { LoadingSpinner } from '../components';

export function MenuEditorPage() {
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

  if (restaurantId === null) {
    return <Navigate to="/register-restaurant" replace />;
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <MenuEditorContainer />
    </div>
  );
}
