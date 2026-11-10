import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Optional listing photos need a Firebase Storage bucket, which requires the Blaze plan.
 * Set EXPO_PUBLIC_FIREBASE_STORAGE_ENABLED=true in .env once Storage is set up; until
 * then the listing photo field is hidden. (Profile pictures and past-work photos are
 * stored in Firestore instead, so they work on the free Spark plan.)
 */
export const STORAGE_ENABLED = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_ENABLED === 'true';

/**
 * Whether the native map can be shown. A compiled Android build without a Google Maps
 * API key crashes as soon as the map opens, and the browser has no native map, so in both
 * cases the Map tab shows the same list of providers sorted by distance instead.
 * Expo Go needs no key and a native iOS build uses Apple Maps.
 */
export const NATIVE_MAP_AVAILABLE =
  Platform.OS === 'ios' ||
  (Platform.OS === 'android' &&
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient) ||
  (Platform.OS === 'android' && Constants.expoConfig?.extra?.googleMapsEnabled === true);
