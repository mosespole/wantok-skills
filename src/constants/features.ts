/**
 * Optional listing photos need a Firebase Storage bucket, which requires the Blaze plan.
 * Set EXPO_PUBLIC_FIREBASE_STORAGE_ENABLED=true in .env once Storage is set up; until
 * then the listing photo field is hidden. (Profile pictures and past-work photos are
 * stored in Firestore instead, so they work on the free Spark plan.)
 */
export const STORAGE_ENABLED = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_ENABLED === 'true';
