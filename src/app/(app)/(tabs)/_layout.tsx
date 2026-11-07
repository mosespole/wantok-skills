import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];
type IconColor = ComponentProps<typeof Ionicons>['color'];

function tabIcon(name: IconName, focusedName: IconName) {
  function TabIcon({ color, focused, size }: { color: IconColor; focused: boolean; size: number }) {
    return <Ionicons name={focused ? focusedName : name} color={color} size={size} />;
  }
  return TabIcon;
}

/** Bottom tabs. The first tab is the customer Home or the provider Dashboard. */
export default function TabsLayout() {
  const { profile } = useAuth();
  const isProvider = profile?.role === 'provider';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: isProvider ? 'Dashboard' : 'Home',
          tabBarIcon: isProvider
            ? tabIcon('grid-outline', 'grid')
            : tabIcon('home-outline', 'home'),
        }}
      />

      {/* Role-specific second tab. Guards also block the hidden tab's URL. */}
      <Tabs.Protected guard={!isProvider}>
        <Tabs.Screen
          name="explore"
          options={{ title: 'Explore', tabBarIcon: tabIcon('search-outline', 'search') }}
        />
      </Tabs.Protected>
      <Tabs.Protected guard={isProvider}>
        <Tabs.Screen
          name="my-services"
          options={{
            title: 'My services',
            tabBarIcon: tabIcon('briefcase-outline', 'briefcase'),
          }}
        />
      </Tabs.Protected>

      <Tabs.Screen
        name="map"
        options={{ title: 'Map', tabBarIcon: tabIcon('map-outline', 'map') }}
      />
      <Tabs.Screen
        name="favourites"
        options={{ title: 'Favourites', tabBarIcon: tabIcon('heart-outline', 'heart') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: tabIcon('person-outline', 'person') }}
      />
    </Tabs>
  );
}
