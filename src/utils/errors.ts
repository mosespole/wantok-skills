import { FirebaseError } from 'firebase/app';

import { t, tMessage, type TranslationKey } from '@/i18n';

/** Messages (as translation keys) for the Firebase error codes users are most likely to hit. */
const FIREBASE_MESSAGES: Record<string, TranslationKey> = {
  'auth/invalid-credential': 'errors.invalidCredentials',
  'auth/invalid-email': 'errors.invalidEmail',
  'auth/user-disabled': 'errors.userDisabled',
  'auth/user-not-found': 'errors.invalidCredentials',
  'auth/wrong-password': 'errors.invalidCredentials',
  'auth/email-already-in-use': 'errors.emailInUse',
  'auth/weak-password': 'errors.weakPassword',
  'auth/too-many-requests': 'errors.tooManyRequests',
  'auth/network-request-failed': 'errors.network',
  'permission-denied': 'errors.permissionDenied',
  unavailable: 'errors.unavailable',
  'deadline-exceeded': 'errors.deadline',
  'not-found': 'errors.notFound',
  'storage/unauthorized': 'errors.storageUnauthorized',
  'storage/canceled': 'errors.uploadCancelled',
  'storage/retry-limit-exceeded': 'errors.uploadRetry',
};

/**
 * Converts any thrown value into a message that is safe and useful to show the user,
 * in the app's current language. App errors carry a translation key as their message.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    const key = FIREBASE_MESSAGES[error.code];
    return key ? t(key) : t('errors.generic');
  }
  if (error instanceof Error && error.message) {
    return tMessage(error.message);
  }
  return t('errors.generic');
}
