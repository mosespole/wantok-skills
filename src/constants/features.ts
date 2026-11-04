/**
 * Photo uploads need a Firebase Storage bucket, which requires the Blaze plan.
 * Set EXPO_PUBLIC_FIREBASE_STORAGE_ENABLED=true in .env once Storage is set up;
 * until then all photo-upload controls are hidden and avatars show initials.
 */
export const STORAGE_ENABLED = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_ENABLED === 'true';
