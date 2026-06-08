import { useState, useCallback, useRef } from 'react';

import { getCurrentPosition, reverseGeocode } from '../../lib';

type LocationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; city: string }
  | { status: 'error'; error: string };

export function useUserLocation() {
  const [state, setState] = useState<LocationState>({ status: 'idle' });
  const requestIdRef = useRef(0);

  const detectLocation = useCallback(async (): Promise<string | null> => {
    const requestId = ++requestIdRef.current;
    setState({ status: 'loading' });

    try {
      const coords = await getCurrentPosition();

      // Check for stale request before continuing
      if (requestIdRef.current !== requestId) return null;

      const result = await reverseGeocode(coords.lat, coords.lon);

      // Check for stale request before updating state
      if (requestIdRef.current !== requestId) return null;

      if (result) {
        setState({ status: 'success', city: result.city });
        return result.city;
      } else {
        setState({ status: 'error', error: 'Could not determine your city' });
        return null;
      }
    } catch (err) {
      // Check for stale request before updating state
      if (requestIdRef.current !== requestId) return null;

      const message =
        err instanceof Error ? err.message : 'Unable to get location';
      setState({ status: 'error', error: message });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    // Invalidate any in-flight requests
    ++requestIdRef.current;
    setState({ status: 'idle' });
  }, []);

  return {
    ...state,
    isLoading: state.status === 'loading',
    detectLocation,
    reset,
  };
}
