import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Small JSON cache on top of AsyncStorage, used only as a fallback when
 * Firestore cannot be reached. Firestore stays the source of truth.
 */

const PREFIX = 'wantok-cache:';

export const CACHE_KEYS = {
  activeServices: 'active-services',
  profile: (uid: string) => `profile:${uid}`,
};

interface CacheEntry<T> {
  savedAt: string;
  data: T;
}

// JSON turns Date objects into ISO strings; this turns them back into Dates when reading.
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
function reviveDates(_key: string, value: unknown): unknown {
  return typeof value === 'string' && ISO_DATE.test(value) ? new Date(value) : value;
}

/** Saves data with the current time. Failures are ignored: caching is a convenience, not essential. */
export async function saveCache<T>(key: string, data: T): Promise<void> {
  const entry: CacheEntry<T> = { savedAt: new Date().toISOString(), data };
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // Storage full or unavailable: the app still works without the cache.
  }
}

/** Returns the cached data and when it was saved, or null if nothing usable is stored. */
export async function loadCache<T>(key: string): Promise<{ data: T; savedAt: Date } | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw, reviveDates) as CacheEntry<T>;
    return { data: entry.data, savedAt: new Date(entry.savedAt) };
  } catch {
    return null;
  }
}

export async function removeCache(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(PREFIX + key);
  } catch {
    // Nothing useful to do if removal fails.
  }
}
