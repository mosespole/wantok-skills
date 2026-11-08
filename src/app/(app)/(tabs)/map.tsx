import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton, AppText, Avatar, Card, ErrorState, LoadingState } from '@/components/common';
import { DataStatusNotice } from '@/components/common/DataStatusNotice';
import { ProviderListFallback } from '@/components/map/ProviderListFallback';
import { ProviderMap, type ProviderMapHandle } from '@/components/map/ProviderMap';
import { NATIVE_MAP_AVAILABLE } from '@/constants/features';
import { getCategoryLabel } from '@/constants/categories';
import { useCurrentLocation } from '@/hooks/useLocation';
import { useActiveServices } from '@/hooks/useServices';
import { distanceInKm } from '@/services/location/locationService';
import { colors, radius, shadows, spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';
import { buildProviderPins, type ProviderPin } from '@/utils/mapPins';

import { t, tCount } from '@/i18n';
// Keeps the round buttons above the selected-provider card.
const SELECTED_CARD_SPACE = 190;

/** Map: the user's real position plus one marker per provider with saved coordinates. */
export default function MapScreen() {
  const mapRef = useRef<ProviderMapHandle>(null);
  const servicesQuery = useActiveServices();
  const location = useCurrentLocation();
  const { requestLocation } = location;
  const [selected, setSelected] = useState<ProviderPin | null>(null);

  const pins = buildProviderPins(servicesQuery.data?.services ?? []);

  // Ask for location when the map opens (the moment it is actually needed).
  useEffect(() => {
    void requestLocation();
  }, [requestLocation]);

  // Centre on the user whenever a real position arrives.
  const userCoords = location.coords;
  useEffect(() => {
    if (userCoords) mapRef.current?.centreOn(userCoords);
  }, [userCoords]);

  const showAllProviders = () => {
    if (pins.length === 0) return;
    mapRef.current?.fitTo(pins.map((pin) => pin.coordinate));
  };

  const centreOnMe = async () => {
    const coords = userCoords ?? (await requestLocation())?.coords;
    if (coords) mapRef.current?.centreOn(coords);
  };

  const selectedDistance =
    selected && location.coords ? distanceInKm(location.coords, selected.coordinate) : null;
  // Same wording as the listing cards: under 1 km shows as "<1 km".
  const distanceText =
    selectedDistance === null
      ? null
      : t('common.kmAway', {
          distance: selectedDistance < 1 ? '<1' : Math.round(selectedDistance),
        });

  if (servicesQuery.isLoading) return <LoadingState message={t('map.loading')} />;
  if (servicesQuery.isError && !servicesQuery.data) {
    return (
      <ErrorState
        message={getErrorMessage(servicesQuery.error)}
        onRetry={() => servicesQuery.refetch()}
        retrying={servicesQuery.isFetching}
      />
    );
  }

  // Without a Google Maps key a compiled Android build would crash here; show a list instead.
  if (!NATIVE_MAP_AVAILABLE) {
    return <ProviderListFallback pins={pins} userCoords={userCoords} />;
  }

  const locationProblem =
    location.status === 'permission-denied' ||
    location.status === 'services-disabled' ||
    location.status === 'error';

  return (
    <View style={styles.container}>
      <ProviderMap
        ref={mapRef}
        pins={pins}
        selectedId={selected?.providerId ?? null}
        userCoords={userCoords}
        showsUserLocation={location.status === 'success'}
        onSelect={setSelected}
        onMapPress={() => setSelected(null)}
      />

      <SafeAreaView edges={['top']} style={styles.topOverlay} pointerEvents="box-none">
        <DataStatusNotice
          source={servicesQuery.data?.source}
          updatedAt={servicesQuery.data?.updatedAt}
          onRetry={() => servicesQuery.refetch()}
        />
        <Card style={styles.statusCard}>
          <AppText variant="bodyStrong">{tCount('map.providersOnMap', pins.length)}</AppText>
          {location.status === 'locating' && (
            <AppText variant="caption" color="textSecondary">
              {t('map.locating')}
            </AppText>
          )}
          {locationProblem && (
            <View style={styles.locationWarning}>
              <AppText variant="caption" color="warning">
                {location.message ?? t('map.locationUnavailable')} {t('map.browseAll')}
              </AppText>
              {location.status === 'permission-denied' && !location.canAskAgain ? (
                <Pressable onPress={location.openSettings} accessibilityRole="link">
                  <AppText variant="label" color="primary">
                    {t('common.openSettings')}
                  </AppText>
                </Pressable>
              ) : (
                <Pressable onPress={centreOnMe} accessibilityRole="button">
                  <AppText variant="label" color="primary">
                    {t('common.tryAgain')}
                  </AppText>
                </Pressable>
              )}
            </View>
          )}
          {pins.length === 0 && (
            <AppText variant="caption" color="textSecondary">
              {t('map.noPins')}
            </AppText>
          )}
        </Card>
      </SafeAreaView>

      <View
        style={[styles.fabColumn, { bottom: selected ? SELECTED_CARD_SPACE : spacing.lg }]}
        pointerEvents="box-none"
      >
        <Pressable
          style={styles.fab}
          onPress={showAllProviders}
          accessibilityRole="button"
          accessibilityLabel={t('map.showAll')}
        >
          <Ionicons name="people-outline" size={22} color={colors.primary} />
        </Pressable>
        <Pressable
          style={styles.fab}
          onPress={centreOnMe}
          accessibilityRole="button"
          accessibilityLabel={t('map.centreOnMe')}
        >
          <Ionicons name="locate" size={22} color={colors.primary} />
        </Pressable>
      </View>

      {selected && (
        <Card style={styles.selectedCard}>
          <View style={styles.selectedRow}>
            <Avatar
              name={selected.provider.fullName}
              imageUrl={selected.provider.profileImageUrl}
              size={52}
            />
            <View style={styles.flex}>
              <AppText variant="bodyStrong" numberOfLines={1}>
                {selected.provider.fullName}
              </AppText>
              <AppText variant="caption" color="primary" numberOfLines={1}>
                {selected.categories.map(getCategoryLabel).join(', ')}
              </AppText>
              <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                {[
                  selected.provider.locationName,
                  distanceText,
                  tCount('common.listings', selected.listingCount),
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </AppText>
            </View>
            <Pressable
              onPress={() => setSelected(null)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
            >
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </Pressable>
          </View>
          <AppButton
            title={t('common.viewProfile')}
            onPress={() =>
              router.push({ pathname: '/provider/[id]', params: { id: selected.providerId } })
            }
          />
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  statusCard: { gap: spacing.xs, padding: spacing.md },
  locationWarning: { gap: spacing.xs },
  fabColumn: {
    position: 'absolute',
    right: spacing.lg,
    gap: spacing.md,
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.raised,
  },
  selectedCard: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    gap: spacing.md,
    ...shadows.raised,
  },
  selectedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
