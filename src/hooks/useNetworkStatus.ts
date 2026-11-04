import { useNetworkState } from 'expo-network';

/** Live connection status. Only an explicit `false` counts as offline (Android may still be checking). */
export function useNetworkStatus() {
  const state = useNetworkState();
  const isOffline = state.isConnected === false || state.isInternetReachable === false;
  return { isOffline };
}
