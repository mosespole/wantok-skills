import * as Network from 'expo-network';

/** Thrown when an action needs the internet but the device is offline. */
export class OfflineError extends Error {
  constructor(message = 'errors.offline') {
    super(message);
    this.name = 'OfflineError';
  }
}

/**
 * True unless the device reports no connection. `isInternetReachable` can be
 * undefined while Android is still checking, so only an explicit `false` counts as offline.
 */
export async function isOnline(): Promise<boolean> {
  try {
    const state = await Network.getNetworkStateAsync();
    return state.isConnected !== false && state.isInternetReachable !== false;
  } catch {
    // If the network state cannot be read, let the request try anyway.
    return true;
  }
}

/**
 * Call before writing to Firebase. Offline Firestore writes would otherwise wait
 * silently until the connection returns, leaving the save button spinning.
 */
export async function ensureOnline(): Promise<void> {
  if (!(await isOnline())) throw new OfflineError();
}
