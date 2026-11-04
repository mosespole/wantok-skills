import { useImperativeHandle, useRef, type Ref } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';

import { getCategoryLabel } from '@/constants/categories';
import type { Coordinates } from '@/services/location/locationService';
import { colors } from '@/theme';
import type { ProviderPin } from '@/utils/mapPins';

/** Camera controls the Map screen can call. */
export interface ProviderMapHandle {
  centreOn: (coords: Coordinates) => void;
  fitTo: (coords: Coordinates[]) => void;
}

export interface ProviderMapProps {
  pins: ProviderPin[];
  selectedId: string | null;
  userCoords: Coordinates | null;
  showsUserLocation: boolean;
  onSelect: (pin: ProviderPin) => void;
  onMapPress: () => void;
  ref?: Ref<ProviderMapHandle>;
}

/**
 * Initial camera before any real position is known: the whole of Papua New Guinea.
 * This only frames the map; it is never used as the user's location.
 */
const PNG_OVERVIEW: Region = {
  latitude: -6.5,
  longitude: 146.5,
  latitudeDelta: 12,
  longitudeDelta: 12,
};
const USER_ZOOM = { latitudeDelta: 0.15, longitudeDelta: 0.15 };
const EDGE_PADDING = { top: 140, right: 60, bottom: 260, left: 60 };

/**
 * Native map (Android/iOS) using react-native-maps, which is bundled in Expo Go.
 * The web build uses ProviderMap.web.tsx instead, because react-native-maps has no web support.
 */
export function ProviderMap({
  pins,
  selectedId,
  userCoords,
  showsUserLocation,
  onSelect,
  onMapPress,
  ref,
}: ProviderMapProps) {
  const mapRef = useRef<MapView>(null);

  useImperativeHandle(ref, () => ({
    centreOn: (coords) => mapRef.current?.animateToRegion({ ...coords, ...USER_ZOOM }, 600),
    fitTo: (coords) =>
      mapRef.current?.fitToCoordinates(coords, { edgePadding: EDGE_PADDING, animated: true }),
  }));

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      initialRegion={userCoords ? { ...userCoords, ...USER_ZOOM } : PNG_OVERVIEW}
      showsUserLocation={showsUserLocation}
      showsMyLocationButton={false}
      toolbarEnabled={false}
      onPress={onMapPress}
    >
      {pins.map((pin) => (
        <Marker
          key={pin.providerId}
          coordinate={pin.coordinate}
          title={pin.provider.fullName}
          description={pin.categories.map(getCategoryLabel).join(', ')}
          pinColor={selectedId === pin.providerId ? colors.accentGold : colors.primary}
          onPress={() => onSelect(pin)}
        />
      ))}
    </MapView>
  );
}
