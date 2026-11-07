import { Ionicons } from '@expo/vector-icons';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProviderCard } from '@/components/cards/ProviderCard';
import { AppText, EmptyState } from '@/components/common';
import type { Coordinates } from '@/services/location/locationService';
import { distanceInKm } from '@/services/location/locationService';
import { colors, radius, spacing } from '@/theme';
import type { ProviderPin } from '@/utils/mapPins';

interface ProviderListFallbackProps {
  pins: ProviderPin[];
  userCoords: Coordinates | null;
}

/**
 * Shown on the Map tab when this build cannot display Google Maps (no API key).
 * Lists the same providers the map would show, nearest first when the location is known.
 */
export function ProviderListFallback({ pins, userCoords }: ProviderListFallbackProps) {
  const sorted = userCoords
    ? [...pins].sort(
        (a, b) => distanceInKm(userCoords, a.coordinate) - distanceInKm(userCoords, b.coordinate),
      )
    : pins;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={sorted}
        keyExtractor={(pin) => pin.providerId}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppText variant="title">Providers near you</AppText>
            <View style={styles.notice}>
              <Ionicons name="map-outline" size={20} color={colors.primary} />
              <AppText variant="caption" color="textSecondary" style={styles.flex}>
                The map view is not available in this version of the app.{' '}
                {userCoords
                  ? 'Providers are listed nearest first.'
                  : 'Allow location access to list the nearest providers first.'}
              </AppText>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="location-outline"
            title="No providers on the map yet"
            message="Providers appear here once they add a map location to their profile or listings."
          />
        }
        renderItem={({ item }) => <ProviderCard provider={item.provider} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  list: { flexGrow: 1, padding: spacing.lg },
  header: { gap: spacing.md, marginBottom: spacing.md },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  separator: { height: spacing.md },
});
