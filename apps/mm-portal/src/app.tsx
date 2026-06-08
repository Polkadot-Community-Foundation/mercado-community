import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from 'react';
import type { ReactNode } from 'react';
import type { MatchMaker, MatchMakerRegistrationInput } from '@mercado/types';
import { useAuth } from '@mercado/core-hooks';

/** Min/max fee percentage (0-10%) */
const MIN_FEE_PERCENT = 0;
const MAX_FEE_PERCENT = 10;

import { RegisterPage } from './pages/RegisterPage';
import { PortalPage } from './pages/PortalPage';
import { AppShell } from './components/AppShell';

// Matchmaker state that integrates with Host API auth
type MatchMakerState = {
  isConnected: boolean;
  isAuthLoading: boolean;
  address: string | null;
  matchMaker: MatchMaker | null;
  isLoading: boolean;
  register: (input: MatchMakerRegistrationInput) => Promise<string>;
  updateFee: (newFeePercent: number) => Promise<void>;
  claimFees: () => Promise<void>;
};

const MatchMakerContext = createContext<MatchMakerState | null>(null);

export function useMatchMakerState(): MatchMakerState {
  const ctx = useContext(MatchMakerContext);
  if (!ctx) throw new Error('MatchMakerProvider required');
  return ctx;
}

function MatchMakerProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [matchMaker, setMatchMaker] = useState<MatchMaker | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Derive connection state from auth
  const isConnected = auth.isAuthenticated;
  const isAuthLoading = auth.isLoading;
  const address = auth.account?.address ?? null;

  // Clear matchMaker state when auth changes (security: prevent stale session access)
  useEffect(() => {
    if (!isConnected || !address) {
      setMatchMaker(null);
    } else if (matchMaker && matchMaker.owner !== address) {
      // Different account connected - clear old session data
      setMatchMaker(null);
    }
  }, [isConnected, address, matchMaker]);

  const register = useCallback(
    async (input: MatchMakerRegistrationInput): Promise<string> => {
      if (!address) throw new Error('Not connected');

      // Validate fee percentage
      if (
        input.feePercentage < MIN_FEE_PERCENT ||
        input.feePercentage > MAX_FEE_PERCENT
      ) {
        throw new Error(
          `Fee must be between ${MIN_FEE_PERCENT}% and ${MAX_FEE_PERCENT}%`,
        );
      }

      setIsLoading(true);
      try {
        // Simulate network delay (TODO: replace with real contract call)
        await new Promise((r) => setTimeout(r, 1000));

        const id = String(Date.now());
        const feeBps = Math.round(input.feePercentage * 100);

        setMatchMaker({
          id,
          owner: address,
          name: input.name,
          feePercentage: feeBps,
          registeredAt: Date.now(),
          active: true,
          feesAccumulated: 0n,
        });

        return id;
      } finally {
        setIsLoading(false);
      }
    },
    [address],
  );

  const updateFee = useCallback(
    async (newFeePercent: number): Promise<void> => {
      if (!matchMaker) throw new Error('Not registered');

      // Validate fee percentage
      if (newFeePercent < MIN_FEE_PERCENT || newFeePercent > MAX_FEE_PERCENT) {
        throw new Error(
          `Fee must be between ${MIN_FEE_PERCENT}% and ${MAX_FEE_PERCENT}%`,
        );
      }

      setIsLoading(true);
      try {
        // Simulate network delay (TODO: replace with real contract call)
        await new Promise((r) => setTimeout(r, 500));

        setMatchMaker((prev) =>
          prev
            ? { ...prev, feePercentage: Math.round(newFeePercent * 100) }
            : null,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [matchMaker],
  );

  const claimFees = useCallback(async (): Promise<void> => {
    if (!matchMaker) throw new Error('Not registered');

    setIsLoading(true);
    try {
      // Simulate network delay (TODO: replace with real contract call)
      await new Promise((r) => setTimeout(r, 500));

      setMatchMaker((prev) => (prev ? { ...prev, feesAccumulated: 0n } : null));
    } finally {
      setIsLoading(false);
    }
  }, [matchMaker]);

  return (
    <MatchMakerContext.Provider
      value={{
        isConnected,
        isAuthLoading,
        address,
        matchMaker,
        isLoading,
        register,
        updateFee,
        claimFees,
      }}
    >
      {children}
    </MatchMakerContext.Provider>
  );
}

function RequireConnection({ children }: { children: ReactNode }) {
  const { isConnected, isAuthLoading } = useMatchMakerState();

  // Don't redirect while auth is still loading - prevents flash
  if (isAuthLoading) {
    return (
      <div className="flex justify-center py-8">
        <span className="text-text-secondary">Connecting...</span>
      </div>
    );
  }

  if (!isConnected) {
    return <Navigate to="/register" replace />;
  }
  return <>{children}</>;
}

function RequireRegistration({ children }: { children: ReactNode }) {
  const { matchMaker, isAuthLoading, address } = useMatchMakerState();

  // Don't redirect while auth is still loading
  if (isAuthLoading) {
    return (
      <div className="flex justify-center py-8">
        <span className="text-text-secondary">Loading...</span>
      </div>
    );
  }

  // Also verify ownership for security
  if (!matchMaker || matchMaker.owner !== address) {
    return <Navigate to="/register" replace />;
  }
  return <>{children}</>;
}

export function App() {
  return (
    <MatchMakerProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/"
              element={
                <RequireConnection>
                  <RequireRegistration>
                    <PortalPage />
                  </RequireRegistration>
                </RequireConnection>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </MatchMakerProvider>
  );
}
