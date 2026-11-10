import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/useAuth';
import { colors, fonts, radius, shadows } from '@/theme';

import { t } from '@/i18n';
type IconName = ComponentProps<typeof Ionicons>['name'];
type IconColor = ComponentProps<typeof Ionicons>['color'];

/** Tab icon with a soft green pill behind it when the tab is active. */
function tabIcon(name: IconName, focusedName: IconName) {
  function TabIcon({ color, focused }: { color: IconColor; focused: boolean; size: number }) {
    return (
      <View style={[styles.iconPill, focused && styles.iconPillActive]}>
        <Ionicons name={focused ? focusedName : name} color={color} size={22} />
      </View>
    );
  }
  return TabIcon;
}

/** Pill icon (30) + label (about 16) + top and bottom padding. */
const TAB_BAR_CONTENT_HEIGHT = 74;

const styles = StyleSheet.create({
  iconPill: {
    width: 56,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: { backgroundColor: colors.primaryLight },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 0,
    paddingTop: 6,
    ...shadows.raised,
  },
  label: { fontFamily: fonts.semibold, fontSize: 11, marginTop: 2 },
  tabItem: { paddingVertical: 2 },
});

/** Bottom tabs. The first tab is the customer Home or the provider Dashboard. */
export default function TabsLayout() {
  const { profile } = useAuth();
  const isProvider = profile?.role === 'provider';
  // Fixed height (pill icon + label) plus the phone's bottom safe area, so the labels are
  // never pushed out of view. The default height is too short for the pill icons on web.
  const insets = useSafeAreaInsets();
  const tabBarHeight = TAB_BAR_CONTENT_HEIGHT + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: [styles.tabBar, { height: tabBarHeight, paddingBottom: insets.bottom + 10 }],
        tabBarItemStyle: styles.tabItem,
        tabBarLabelStyle: styles.label,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: isProvider ? t('tabs.dashboard') : t('tabs.home'),
          tabBarIcon: isProvider
            ? tabIcon('grid-outline', 'grid')
            : tabIcon('home-outline', 'home'),
        }}
      />

      {/* Role-specific second tab. Guards also block the hidden tab's URL. */}
      <Tabs.Protected guard={!isProvider}>
        <Tabs.Screen
          name="explore"
          options={{ title: t('tabs.explore'), tabBarIcon: tabIcon('search-outline', 'search') }}
        />
      </Tabs.Protected>
      <Tabs.Protected guard={isProvider}>
        <Tabs.Screen
          name="my-services"
          options={{
            title: t('tabs.myServices'),
            tabBarIcon: tabIcon('briefcase-outline', 'briefcase'),
          }}
        />
      </Tabs.Protected>

      <Tabs.Screen
        name="map"
        options={{ title: t('tabs.map'), tabBarIcon: tabIcon('map-outline', 'map') }}
      />
      <Tabs.Screen
        name="favourites"
        options={{ title: t('tabs.favourites'), tabBarIcon: tabIcon('heart-outline', 'heart') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t('tabs.profile'), tabBarIcon: tabIcon('person-outline', 'person') }}
      />
    </Tabs>
  );
}
