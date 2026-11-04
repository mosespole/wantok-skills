import { FirebaseError } from 'firebase/app';

/** Human-readable messages for the Firebase error codes users are most likely to hit. */
const FIREBASE_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/invalid-email': 'That email address is not valid.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/email-already-in-use': 'An account with this email already exists. Try logging in.',
  'auth/weak-password': 'Choose a stronger password (at least 8 characters).',
  'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
  'auth/network-request-failed': 'No internet connection. Check your connection and try again.',
  'permission-denied': 'You do not have permission to do that.',
  unavailable: 'The service is unavailable. Check your internet connection and try again.',
  'deadline-exceeded': 'The request took too long. Check your connection and try again.',
  'not-found': 'That item no longer exists.',
  'storage/unauthorized': 'You do not have permission to upload this file.',
  'storage/canceled': 'The upload was cancelled.',
  'storage/retry-limit-exceeded': 'The upload kept failing. Check your connection and try again.',
};

/** Converts any thrown value into a message that is safe and useful to show the user. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return FIREBASE_MESSAGES[error.code] ?? 'Something went wrong. Please try again.';
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
