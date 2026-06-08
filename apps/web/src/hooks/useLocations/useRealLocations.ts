import { useState, useEffect, useCallback } from 'react';

import type { UseLocationsResult } from '../../contexts/DataContext/DataContext';
import { getCurrentPosition, reverseGeocode } from '../../lib/geo';

// Fallback locations when geolocation is unavailable
const FALLBACK_LOCATIONS = [
  'San Francisco',
  'New York',
  'Los Angeles',
  'Chicago',
  'Miami',
];

/**
 * Real implementation of useLocations that detects user's location
 * via browser Geolocation API and reverse geocoding.
 *
 * Falls back to default locations if geolocation fails.
 */
export function useRealLocations(): UseLocationsResult {
  const [locations, setLocations] = useState<string[]>(FALLBACK_LOCATIONS);
  const [isDetecting, setIsDetecting] = useState(false);

  const detectLocation = useCallback(async () => {
    setIsDetecting(true);
    try {
      // Get current coordinates from browser
      const coords = await getCurrentPosition();

      // Reverse geocode to city name
      const result = await reverseGeocode(coords.lat, coords.lon);

      if (result?.city) {
        // Put detected city at the front of the list
        const cityName = result.country
          ? `${result.city}, ${result.country}`
          : result.city;

        setLocations((prev) => {
          // Remove duplicate if exists
          const filtered = prev.filter(
            (loc) => loc.toLowerCase() !== cityName.toLowerCase(),
          );
          return [cityName, ...filtered];
        });
      }
    } catch (err) {
      // Geolocation failed, keep fallback locations
      console.warn('Location detection failed:', err);
    } finally {
      setIsDetecting(false);
    }
  }, []);

  // Auto-detect location on mount
  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  return { locations, isDetecting, detectLocation };
}
