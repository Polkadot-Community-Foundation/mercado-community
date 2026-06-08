import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { useLocations, useUserLocation } from '../hooks';
import { LocationSelector, LoadingSpinner } from '../components';

export function LandingPage() {
  const navigate = useNavigate();
  const { locations } = useLocations();
  const locationState = useUserLocation();
  const { isLoading, detectLocation, status } = locationState;
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function autoDetect() {
      const city = await detectLocation();
      if (cancelled) return;

      if (city) {
        // Check if detected city matches any supported location
        const match = locations.find(
          (loc) => loc.toLowerCase() === city.toLowerCase(),
        );
        if (match) {
          navigate(`/restaurants?location=${encodeURIComponent(match)}`);
          return;
        }
      }
      // No match or error - show manual selector
      setShowManual(true);
    }

    autoDetect();
    return () => {
      cancelled = true;
    };
  }, [detectLocation, locations, navigate]);

  const handleSelect = (location: string) => {
    navigate(`/restaurants?location=${encodeURIComponent(location)}`);
  };

  // Show loading state while detecting
  if (isLoading) {
    return (
      <HeroLayout>
        <div className="flex items-center gap-3">
          <LoadingSpinner size="md" variant="white" />
          <span className="text-lg text-white/90">
            Finding your location...
          </span>
        </div>
      </HeroLayout>
    );
  }

  // Show manual selector
  if (showManual) {
    return (
      <HeroLayout>
        {status === 'error' && 'error' in locationState && (
          <p className="mb-2 text-sm text-white/70">{locationState.error}</p>
        )}
        {status === 'success' && (
          <p className="mb-2 text-sm text-white/70">
            We don't deliver to your area yet
          </p>
        )}
        <p className="mb-4 text-lg text-white/90">Select your city</p>
        <div className="w-full max-w-sm">
          <LocationSelector locations={locations} onSelect={handleSelect} />
        </div>
      </HeroLayout>
    );
  }

  // Initial state (before detection starts)
  return (
    <HeroLayout>
      <p className="text-lg text-white/90">Where are you?</p>
    </HeroLayout>
  );
}

function HeroLayout({ children }: { children: React.ReactNode }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative min-h-[calc(100vh-65px)] overflow-hidden">
      {/* Background - gradient fallback with optional image */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand-dark to-gray-900" />
      {!imageError && (
        <img
          src="https://paseo-ipfs.polkadot.io/ipfs/bafk2bzacecqjgqgpt2aer3ls6umq4a4wfygvqv64pjllv33oyeuzucz6dze44"
          alt=""
          onError={() => setImageError(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />

      {/* Content */}
      <div className="relative flex min-h-[calc(100vh-65px)] flex-col items-center justify-center px-6">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg sm:text-6xl">
            Mercado
          </h1>
          <p className="mt-4 text-xl text-white/90 drop-shadow-md sm:text-2xl">
            Order delivery near you
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">{children}</div>
      </div>
    </div>
  );
}
