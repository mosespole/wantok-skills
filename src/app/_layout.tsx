import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/context/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/theme';

// Keep the native splash screen up until the saved login session has been checked,
// so a signed-in user never sees the login screen flash on startup.
void SplashScreen.preventAutoHideAsync();

// One shared cache for all Firestore queries. Failed requests retry once
// so a brief network drop does not immediately show an error screen.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 60_000 },
    mutations: { retry: 0 },
  },
});

export default function RootLayout() {
  // The app's bundled font. If it fails to load, the app still opens with the system font.
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const fontsReady = fontsLoaded || fontError !== null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar style="dark" />
          {fontsReady ? <RootNavigator /> : null}
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

/**
 * Authentication boundary. Each group is only registered while its guard is true,
 * so typing or deep-linking a URL cannot reach a screen the user is not allowed to see.
 * Only rendered once the font has loaded, so the splash screen covers both.
 */
function RootNavigator() {
  const { status, initialized } = useAuth();

  useEffect(() => {
    if (initialized) SplashScreen.hide();
  }, [initialized]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Protected guard={status === 'signedOut' || status === 'loading'}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={status === 'error'}>
        <Stack.Screen name="account-error" />
      </Stack.Protected>

      <Stack.Protected guard={status === 'signedIn'}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}
