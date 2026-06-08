const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';
const NOMINATIM_USER_AGENT =
  'Mercado Food Delivery (https://github.com/user/mercado)';

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  country?: string;
}

interface NominatimResult {
  address: NominatimAddress;
}

export interface ReverseGeocodeResult {
  city: string;
  country: string;
}

/**
 * Reverse geocode lat/lon via Nominatim to get city and country.
 * Returns null if fetch fails or city/country cannot be determined.
 */
export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<ReverseGeocodeResult | null> {
  try {
    const url = `${NOMINATIM_URL}?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': NOMINATIM_USER_AGENT },
    });
    const data: NominatimResult = await response.json();

    const city =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.municipality ||
      '';
    const country = data.address?.country || '';

    if (!city || !country) return null;

    return { city, country };
  } catch {
    return null;
  }
}

export interface Coordinates {
  lat: number;
  lon: number;
}

/**
 * Get the user's current location using the browser's Geolocation API.
 */
export function getCurrentPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        const messages: Record<number, string> = {
          [error.PERMISSION_DENIED]: 'Location permission denied',
          [error.POSITION_UNAVAILABLE]: 'Location unavailable',
          [error.TIMEOUT]: 'Location request timed out',
        };
        reject(new Error(messages[error.code] || 'Unable to get location'));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  });
}

/**
 * Calculate distance between two coordinates using Haversine formula.
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Add a random offset to coordinates for privacy.
 * Useful when you want to share approximate location instead of exact.
 *
 * @param lat Latitude
 * @param lon Longitude
 * @param maxMeters Maximum offset distance in meters (default 500m)
 * @returns New coordinates with random offset applied
 */
export function randomOffset(
  lat: number,
  lon: number,
  maxMeters: number = 500,
): Coordinates {
  // Random angle in radians
  const angle = Math.random() * 2 * Math.PI;
  // Random distance up to maxMeters
  const distance = Math.random() * maxMeters;

  // Convert meters to degrees (approximate)
  // 1 degree latitude = ~111,320 meters
  const dLat = (distance * Math.cos(angle)) / 111320;
  // 1 degree longitude = ~111,320 * cos(latitude) meters
  const dLon =
    (distance * Math.sin(angle)) / (111320 * Math.cos((lat * Math.PI) / 180));

  return {
    lat: lat + dLat,
    lon: lon + dLon,
  };
}
