import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';

import type { UserProfile, UserRole } from '@/types/user';
import { toLocalPhoneDigits } from '@/utils/formatting';

import { auth } from './firebaseConfig';
import { createUserProfile } from './userService';

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: UserRole;
}

/**
 * Creates the Firebase Auth account, then the matching Firestore profile.
 * The password goes only to Firebase Auth; it is never stored or logged by the app.
 * If the profile cannot be written, the new Auth account is removed.
 */
export async function registerUser(
  input: RegisterInput,
): Promise<{ user: User; profile: UserProfile }> {
  const email = input.email.trim().toLowerCase();
  const credential = await createUserWithEmailAndPassword(auth, email, input.password);

  try {
    await updateProfile(credential.user, { displayName: input.fullName.trim() });
    const profile = await createUserProfile({
      uid: credential.user.uid,
      fullName: input.fullName.trim(),
      email,
      phoneNumber: toLocalPhoneDigits(input.phoneNumber),
      role: input.role,
    });
    return { user: credential.user, profile };
  } catch (error) {
    // Roll back so the email is free to register again; sign out if even that fails.
    await deleteUser(credential.user).catch(() => signOut(auth));
    throw error;
  }
}

export async function loginUser(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return credential.user;
}

export function logoutUser(): Promise<void> {
  return signOut(auth);
}

export function sendPasswordReset(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email.trim());
}

/** Calls `callback` now and whenever the user signs in or out. Returns an unsubscribe function. */
export function subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
