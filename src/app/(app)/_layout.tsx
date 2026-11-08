import { Stack } from 'expo-router';

import { useAuth } from '@/hooks/useAuth';
import { colors, typography } from '@/theme';

import { t } from '@/i18n';
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
      <Stack.Screen name="search" options={{ title: t('screens.search') }} />
      <Stack.Screen name="edit-profile" options={{ title: t('screens.editProfile') }} />
      <Stack.Screen name="work/[id]" options={{ title: t('screens.pastWork') }} />

      {/* Provider-only forms. Customers cannot open these even by URL. */}
      <Stack.Protected guard={isProvider}>
        <Stack.Screen name="create-service" options={{ title: t('screens.newListing') }} />
        <Stack.Screen name="edit-service/[id]" options={{ title: t('screens.editListing') }} />
        <Stack.Screen name="my-work" options={{ title: t('screens.myPastWork') }} />
        <Stack.Screen name="add-work" options={{ title: t('screens.addProject') }} />
        <Stack.Screen name="edit-work/[id]" options={{ title: t('screens.editProject') }} />
      </Stack.Protected>
    </Stack>
  );
}
