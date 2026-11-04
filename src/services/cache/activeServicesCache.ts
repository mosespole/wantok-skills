import { getActiveServices } from '@/services/firebase/serviceService';
import type { ServiceWithProvider } from '@/types/service';
import { withTimeout } from '@/utils/async';

import { CACHE_KEYS, loadCache, saveCache } from './cacheService';

const REMOTE_TIMEOUT_MS = 15_000;

/** Where the listings on screen came from, so the UI can label saved (possibly old) data. */
export type DataSource = 'live' | 'cache';

export interface ActiveServicesResult {
  services: ServiceWithProvider[];
  source: DataSource;
  /** When the data was fetched from Firestore. For cached data, this is when it was saved. */
  updatedAt: Date;
}

/**
 * Loads active listings from Firestore and saves a copy to AsyncStorage.
 * If Firestore cannot be reached, returns the last saved copy instead.
 * Only fails when there is neither a connection nor a saved copy.
 */
export async function fetchActiveServicesWithFallback(): Promise<ActiveServicesResult> {
  try {
    const services = await withTimeout(
      getActiveServices(),
      REMOTE_TIMEOUT_MS,
      'Loading listings took too long. Check your connection and try again.',
    );
    await saveCache(CACHE_KEYS.activeServices, services);
    return { services, source: 'live', updatedAt: new Date() };
  } catch (error) {
    const cached = await loadCache<ServiceWithProvider[]>(CACHE_KEYS.activeServices);
    if (cached) {
      return { services: cached.data, source: 'cache', updatedAt: cached.savedAt };
    }
    throw error;
  }
}
