import { Navigate, useParams, Link } from 'react-router';

import { useAccountInfo } from '../hooks';
import { DisputeDetailContainer } from '../containers';
import { LoadingSpinner } from '../components';

export function DisputeDetailPage() {
  const { account, isLoading } = useAccountInfo();
  const { disputeId } = useParams<{ disputeId: string }>();

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

  if (!disputeId) {
    return <Navigate to="/my-orders" replace />;
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-8">
      <div className="mb-4">
        <Link
          to="/my-orders"
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
        >
          &larr; Back to my orders
        </Link>
      </div>
      <DisputeDetailContainer disputeId={disputeId} />
    </div>
  );
}
