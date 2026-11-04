import { Stack } from 'expo-router';

import { useAuth } from '@/hooks/useAuth';
import { colors, typography } from '@/theme';

/** Signed-in area: the tab bar plus detail and form screens pushed on top of it. */
export default function AppLayout() {
  const { profile } = useAuth();
  const isProvider = profile?.role === 'provider';

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { ...typography.subtitle, color: colors.textPrimary },
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="service/[id]" options={{ title: '' }} />
      <Stack.Screen name="provider/[id]" options={{ title: '' }} />
      <Stack.Screen name="search" options={{ title: 'Search' }} />
      <Stack.Screen name="edit-profile" options={{ title: 'Edit profile' }} />

      {/* Provider-only forms. Customers cannot open these even by URL. */}
      <Stack.Protected guard={isProvider}>
        <Stack.Screen name="create-service" options={{ title: 'New listing' }} />
        <Stack.Screen name="edit-service/[id]" options={{ title: 'Edit listing' }} />
      </Stack.Protected>
    </Stack>
  );
}
