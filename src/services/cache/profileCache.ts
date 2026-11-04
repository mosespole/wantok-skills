import type { UserProfile } from '@/types/user';

import { CACHE_KEYS, loadCache, removeCache, saveCache } from './cacheService';

/**
 * The signed-in user's own profile, saved so the app can open without a connection.
 * It is removed on logout so the next person using the phone cannot see it.
 */
export function saveCachedProfile(profile: UserProfile): Promise<void> {
  return saveCache(CACHE_KEYS.profile(profile.uid), profile);
}

export async function loadCachedProfile(uid: string): Promise<UserProfile | null> {
  const cached = await loadCache<UserProfile>(CACHE_KEYS.profile(uid));
  return cached?.data ?? null;
}

export function clearCachedProfile(uid: string): Promise<void> {
  return removeCache(CACHE_KEYS.profile(uid));
}
