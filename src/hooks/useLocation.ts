import { useCallback, useState } from 'react';
import { Linking } from 'react-native';

import {
  getCurrentCoordinates,
  getPlaceName,
  type Coordinates,
} from '@/services/location/locationService';

export type LocationStatus =
  'idle' | 'locating' | 'success' | 'permission-denied' | 'services-disabled' | 'error';

interface LocationState {
  status: LocationStatus;
  coords: Coordinates | null;
  placeName: string | null;
  message: string | null;
  /** False when Android will no longer show the permission prompt; the user must use Settings. */
  canAskAgain: boolean;
}

const MESSAGES: Record<'permission-denied' | 'services-disabled', string> = {
  'permission-denied':
    'Location permission was denied. You can still type your location, or allow access in Settings.',
  'services-disabled': 'Location services are turned off. Turn on GPS/Location and try again.',
};

/** Requests the device's location on demand and tracks loading, success and failure states. */
export function useCurrentLocation() {
  const [state, setState] = useState<LocationState>({
    status: 'idle',
    coords: null,
    placeName: null,
    message: null,
    canAskAgain: true,
  });

  const requestLocation = useCallback(async (): Promise<{
    coords: Coordinates;
    placeName: string | null;
  } | null> => {
    setState((previous) => ({ ...previous, status: 'locating', message: null }));
    const result = await getCurrentCoordinates();

    if (result.kind === 'success') {
      const placeName = await getPlaceName(result.coords);
      setState({
        status: 'success',
        coords: result.coords,
        placeName,
        message: null,
        canAskAgain: true,
      });
      return { coords: result.coords, placeName };
    }

    if (result.kind === 'permission-denied') {
      setState((previous) => ({
        ...previous,
        status: 'permission-denied',
        message: MESSAGES['permission-denied'],
        canAskAgain: result.canAskAgain,
      }));
    } else if (result.kind === 'services-disabled') {
      setState((previous) => ({
        ...previous,
        status: 'services-disabled',
        message: MESSAGES['services-disabled'],
      }));
    } else {
      setState((previous) => ({ ...previous, status: 'error', message: result.message }));
    }
    return null;
  }, []);

  const openSettings = useCallback(() => Linking.openSettings(), []);

  return { ...state, requestLocation, openSettings };
}
