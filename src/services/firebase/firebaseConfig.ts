import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase web configuration, read from EXPO_PUBLIC_ environment variables (see .env.example).
 * Expo inlines these at build time, so each variable must be referenced by its full name.
 * These identifiers are publishable; data is protected by firestore.rules and storage.rules.
 */
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  throw new Error(
    `Firebase is not configured. Missing: ${missingKeys.join(', ')}. ` +
      'Copy .env.example to .env, fill in your Firebase web app values, then restart Expo.',
  );
}

// Reuse the existing app during Fast Refresh instead of initialising twice.
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

/**
 * Auth stores the signed-in session in AsyncStorage so users stay logged in
 * after closing the app. initializeAuth can only run once per app, so on
 * Fast Refresh we fall back to the instance that already exists.
 */
function createAuth(): Auth {
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    return getAuth(app);
  }
}

// Only Authentication and Firestore are set up at start-up. Storage is loaded on
// demand by storageService.ts, and only when photo uploads are enabled.
export const auth = createAuth();
export const db = getFirestore(app);
