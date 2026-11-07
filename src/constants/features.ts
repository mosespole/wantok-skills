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
 * API key crashes as soon as the map opens, so the Map tab shows a provider list instead.
 * Expo Go needs no key, iOS uses Apple Maps, and the web build has its own fallback.
 */
export const NATIVE_MAP_AVAILABLE =
  Platform.OS !== 'android' ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  Constants.expoConfig?.extra?.googleMapsEnabled === true;
