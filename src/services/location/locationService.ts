import * as Location from 'expo-location';

import { withTimeout } from '@/utils/async';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Outcome of asking for the device location. Each failure has its own kind so
 * screens can show a specific message (e.g. "open settings" vs "turn on GPS").
 */
export type LocationResult =
  | { kind: 'success'; coords: Coordinates }
  | { kind: 'permission-denied'; canAskAgain: boolean }
  | { kind: 'services-disabled' }
  | { kind: 'error'; message: string };

const CURRENT_POSITION_TIMEOUT_MS = 15_000;
const LAST_KNOWN_MAX_AGE_MS = 5 * 60_000;

/** Asks for foreground permission (only if needed) and returns the real device coordinates. */
export async function getCurrentCoordinates(): Promise<LocationResult> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') {
      return { kind: 'permission-denied', canAskAgain: permission.canAskAgain };
    }

    if (!(await Location.hasServicesEnabledAsync())) {
      return { kind: 'services-disabled' };
    }

    // A recent cached fix is returned instantly; otherwise wait for a fresh GPS reading.
    const lastKnown = await Location.getLastKnownPositionAsync({
      maxAge: LAST_KNOWN_MAX_AGE_MS,
    });
    const position =
      lastKnown ??
      (await withTimeout(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        CURRENT_POSITION_TIMEOUT_MS,
        'Timed out waiting for a GPS fix',
      ));

    return {
      kind: 'success',
      coords: { latitude: position.coords.latitude, longitude: position.coords.longitude },
    };
  } catch {
    return {
      kind: 'error',
      message: 'We could not get your location. Move to an open area and try again.',
    };
  }
}

/**
 * Turns coordinates into a short place name such as "Lae, Morobe".
 * Returns null when no address is available (e.g. offline); callers then ask the user to type it.
 */
export async function getPlaceName(coords: Coordinates): Promise<string | null> {
  try {
    const [address] = await Location.reverseGeocodeAsync(coords);
    if (!address) return null;
    const parts = [address.district ?? address.city ?? address.subregion, address.region].filter(
      (part): part is string => Boolean(part),
    );
    const unique = [...new Set(parts)];
    return unique.length > 0 ? unique.join(', ') : null;
  } catch {
    return null;
  }
}

/** Straight-line distance in kilometres between two points (haversine formula). */
export function distanceInKm(from: Coordinates, to: Coordinates): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(dLon / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
