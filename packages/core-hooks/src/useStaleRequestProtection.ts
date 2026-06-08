import { useRef, useCallback, useMemo } from 'react';

/**
 * Hook to protect against stale request updates.
 * Returns memoized helpers to track request IDs and check if a request is stale.
 *
 * IMPORTANT: The returned object is memoized to maintain stable identity
 * across renders. This is critical for use in dependency arrays.
 */
export function useStaleRequestProtection() {
  const requestIdRef = useRef(0);

  const startRequest = useCallback(() => {
    return ++requestIdRef.current;
  }, []);

  const isStale = useCallback((id: number) => {
    return id !== requestIdRef.current;
  }, []);

  // Memoize the returned object to maintain stable identity
  return useMemo(() => ({ startRequest, isStale }), [startRequest, isStale]);
}
