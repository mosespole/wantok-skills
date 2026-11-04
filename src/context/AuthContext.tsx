import type { User } from 'firebase/auth';
import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

import {
  loginUser,
  logoutUser,
  registerUser,
  sendPasswordReset,
  subscribeToAuthChanges,
  type RegisterInput,
} from '@/services/firebase/authService';
import {
  clearCachedProfile,
  loadCachedProfile,
  saveCachedProfile,
} from '@/services/cache/profileCache';
import { getUserProfile } from '@/services/firebase/userService';
import type { UserProfile } from '@/types/user';
import { withTimeout } from '@/utils/async';
import { getErrorMessage } from '@/utils/errors';

/**
 * - loading:   restoring a saved session, or fetching the profile after login
 * - signedOut: no Firebase user
 * - signedIn:  Firebase user AND Firestore profile are both available
 * - error:     signed in, but the profile could not be loaded (e.g. offline)
 */
export type AuthStatus = 'loading' | 'signedOut' | 'signedIn' | 'error';

interface AuthState {
  status: AuthStatus;
  user: User | null;
  profile: UserProfile | null;
  errorMessage: string | null;
}

export interface AuthContextValue extends AuthState {
  /** False until the saved session has been checked once at startup. */
  initialized: boolean;
  register: (input: RegisterInput) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  /** Re-fetches the profile after an edit, or retries after a failed load. Throws on failure. */
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const PROFILE_TIMEOUT_MS = 15_000;

const initialState: AuthState = {
  status: 'loading',
  user: null,
  profile: null,
  errorMessage: null,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);
  const [initialized, setInitialized] = useState(false);

  // During registration the profile is written by register() itself, so the
  // auth listener must not try to read it before it exists.
  const isRegistering = useRef(false);
  // Uid of the currently signed-in user, used to discard stale profile fetches.
  const currentUid = useRef<string | null>(null);

  const loadProfile = useCallback(async (user: User) => {
    try {
      const profile = await withTimeout(
        getUserProfile(user.uid),
        PROFILE_TIMEOUT_MS,
        'Loading your account took too long. Check your connection and try again.',
      );
      if (currentUid.current !== user.uid) return;
      if (profile) void saveCachedProfile(profile);
      setState(
        profile
          ? { status: 'signedIn', user, profile, errorMessage: null }
          : {
              status: 'error',
              user,
              profile: null,
              errorMessage: 'Your account profile could not be found. Please contact support.',
            },
      );
    } catch (error) {
      // Offline or slow: open the app with the profile saved on this phone, if there is one.
      const cached = await loadCachedProfile(user.uid);
      if (currentUid.current !== user.uid) return;
      setState(
        cached
          ? { status: 'signedIn', user, profile: cached, errorMessage: null }
          : { status: 'error', user, profile: null, errorMessage: getErrorMessage(error) },
      );
    } finally {
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      currentUid.current = user?.uid ?? null;

      if (!user) {
        setState({ ...initialState, status: 'signedOut' });
        setInitialized(true);
        return;
      }
      if (isRegistering.current) return;

      setState((previous) => ({ ...previous, status: 'loading', user }));
      void loadProfile(user);
    });
    return unsubscribe;
  }, [loadProfile]);

  const register = useCallback(async (input: RegisterInput) => {
    isRegistering.current = true;
    try {
      const { user, profile } = await registerUser(input);
      void saveCachedProfile(profile);
      setState({ status: 'signedIn', user, profile, errorMessage: null });
    } finally {
      isRegistering.current = false;
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await loginUser(email, password);
  }, []);

  const logout = useCallback(async () => {
    const uid = currentUid.current;
    await logoutUser();
    if (uid) await clearCachedProfile(uid);
  }, []);

  const resetPassword = useCallback((email: string) => sendPasswordReset(email), []);

  const { user, status } = state;

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    if (status === 'error') {
      // Retrying after a failed load. Status is left as 'error' until the result is
      // known, so the error screen stays visible (with its spinner) instead of flashing.
      await loadProfile(user);
      return;
    }
    // Refresh after an edit: keep the user signed in; let the caller handle failures.
    const profile = await getUserProfile(user.uid);
    if (profile && currentUid.current === user.uid) {
      void saveCachedProfile(profile);
      setState((previous) => ({ ...previous, profile }));
    }
  }, [user, status, loadProfile]);

  return (
    <AuthContext.Provider
      value={{ ...state, initialized, register, login, logout, resetPassword, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
