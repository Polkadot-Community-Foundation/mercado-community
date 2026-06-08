import { useState } from 'react';
import { useNavigate } from 'react-router';
import { hasHostMarkers, useAuth, type AuthError } from '@mercado/core-hooks';

import { useMatchMakerState } from '../app';
import { RegisterForm } from '../components/RegisterForm/RegisterForm';

/** Get user-friendly error message for each auth error type */
function getAuthErrorMessage(authError: AuthError | null): {
  title: string;
  detail: string;
} {
  switch (authError) {
    case 'timeout':
      return {
        title: 'Connection timed out.',
        detail: 'The wallet connection took too long. Please try again.',
      };
    case 'no_product_account':
      return {
        title: 'No product account found.',
        detail:
          'Make sure you have a Mercado product account configured in your wallet.',
      };
    case 'invalid_environment':
      return {
        title: 'Invalid environment.',
        detail:
          'This browser does not appear to be a valid Polkadot Triangle environment.',
      };
    case 'spektr_injection_failed':
      return {
        title: 'Wallet extension failed.',
        detail: 'Could not connect to the wallet extension. Please try again.',
      };
    case 'not_in_container':
      return {
        title: 'Triangle browser required.',
        detail:
          'This app must be opened from within the Polkadot Triangle browser.',
      };
    case 'unknown':
      return {
        title: 'Connection failed.',
        detail: 'An unexpected error occurred. Please try again.',
      };
    case null:
    default:
      return {
        title: 'Please log in to your wallet to continue.',
        detail:
          'Use the account menu in the top-right corner of the Triangle browser to connect your wallet.',
      };
  }
}

export function RegisterContainer() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { isConnected, isAuthLoading, register, isLoading } =
    useMatchMakerState();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (name: string, feePercentage: number) => {
    setError(null);
    try {
      await register({ name, feePercentage });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  // Show loading state while auth is connecting
  if (isAuthLoading) {
    return (
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Become a Matchmaker</h1>
        <div className="card text-center">
          <p className="text-text-secondary">Connecting to wallet...</p>
        </div>
      </div>
    );
  }

  // Show helpful message if not authenticated
  if (!isConnected) {
    // Use hasHostMarkers for accurate detection (iframe alone isn't enough)
    const inHost = hasHostMarkers();
    const errorMsg = getAuthErrorMessage(auth.authError);

    return (
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Become a Matchmaker</h1>
        <div className="card text-center space-y-3">
          {inHost ? (
            <>
              <p className="text-text-secondary">{errorMsg.title}</p>
              <p className="text-sm text-text-tertiary">{errorMsg.detail}</p>
              <button
                onClick={() => auth.refetch()}
                className="text-sm text-primary hover:underline"
              >
                Retry connection
              </button>
            </>
          ) : (
            <>
              <p className="text-text-secondary">
                This app requires the Polkadot Triangle browser.
              </p>
              <p className="text-sm text-text-tertiary">
                Visit{' '}
                <a
                  href="https://polkadot.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  polkadot.com
                </a>{' '}
                and open this app from within the Triangle browser to access
                your wallet.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Become a Matchmaker</h1>
      <RegisterForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
