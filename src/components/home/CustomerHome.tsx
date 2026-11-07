import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ServiceCard } from '@/components/cards/ServiceCard';
import {
  AppButton,
  AppText,
  Avatar,
  ErrorState,
  HeaderBanner,
  LoadingState,
  Screen,
  SectionHeader,
} from '@/components/common';
import { DataStatusNotice } from '@/components/common/DataStatusNotice';
import { SearchBar } from '@/components/common/SearchBar';
import { APP_SLOGAN_TOK_PISIN, APP_TAGLINE, tokPisinGreeting } from '@/constants/app';
import { CATEGORIES } from '@/constants/categories';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentLocation } from '@/hooks/useLocation';
import { useActiveServices } from '@/hooks/useServices';
import { distanceInKm } from '@/services/location/locationService';
import { colors, radius, spacing } from '@/theme';
import type { ServiceWithProvider } from '@/types/service';
import { getErrorMessage } from '@/utils/errors';

const SECTION_SIZE = 4;
const NEARBY_RADIUS_KM = 50;

/**
 * "Featured" = the most complete listings (photo, price and provider photo),
 * so the first thing customers see looks trustworthy.
 */
function completenessScore(service: ServiceWithProvider): number {
  return (
    (service.imageUrl ? 2 : 0) +
    (service.startingPrice !== null ? 1 : 0) +
    (service.provider?.profileImageUrl ? 1 : 0)
  );
}

export function CustomerHome() {
  const { profile } = useAuth();
  const servicesQuery = useActiveServices();
  const location = useCurrentLocation();

  const services = servicesQuery.data?.services ?? [];
  const recent = services.slice(0, SECTION_SIZE);
  const featured = [...services]
    .filter((service) => completenessScore(service) > 0)
    .sort((a, b) => completenessScore(b) - completenessScore(a))
    .slice(0, SECTION_SIZE);

  const nearby = location.coords
    ? services
        .filter((service) => service.latitude !== null && service.longitude !== null)
        .map((service) => ({
          service,
          distance: distanceInKm(location.coords!, {
            latitude: service.latitude!,
            longitude: service.longitude!,
          }),
        }))
        .filter((item) => item.distance <= NEARBY_RADIUS_KM)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, SECTION_SIZE)
    : [];

  const firstName = profile?.fullName.split(' ')[0] ?? '';

  return (
    <Screen
      edges={[]}
      padded={false}
      onRefresh={() => servicesQuery.refetch()}
      refreshing={servicesQuery.isRefetching}
    >
      <HeaderBanner>
        <View style={styles.greetingRow}>
          <View style={styles.flex}>
            <AppText variant="label" color="textOnPrimaryMuted">
              {tokPisinGreeting()}!
            </AppText>
            <AppText variant="title" color="textOnPrimary" numberOfLines={1}>
              Hello, {firstName}
            </AppText>
          </View>
          <Pressable
            onPress={() => router.navigate('/profile')}
            style={styles.avatarRing}
            accessibilityRole="button"
            accessibilityLabel="Open your profile"
          >
            <Avatar name={profile?.fullName ?? ''} imageUrl={profile?.profileImageUrl} size={44} />
          </Pressable>
        </View>
        <View style={styles.slogan}>
          <AppText variant="subtitle" color="textOnPrimary">
            {APP_SLOGAN_TOK_PISIN}
          </AppText>
          <AppText variant="caption" color="textOnPrimaryMuted">
            {APP_TAGLINE}
          </AppText>
        </View>
        <SearchBar onPress={() => router.push('/search')} />
      </HeaderBanner>

      <View style={styles.content}>
        <DataStatusNotice
          source={servicesQuery.data?.source}
          updatedAt={servicesQuery.data?.updatedAt}
          onRetry={() => servicesQuery.refetch()}
        />

        <View>
          <SectionHeader
            title="Categories"
            actionLabel="See all"
            onAction={() => router.navigate('/explore')}
          />
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((category) => (
              <Pressable
                key={category.id}
                style={({ pressed }) => [styles.categoryTile, pressed && styles.pressed]}
                onPress={() =>
                  router.navigate({ pathname: '/explore', params: { category: category.id } })
                }
                accessibilityRole="button"
                accessibilityLabel={`Browse ${category.label}`}
              >
                <View style={[styles.categoryIcon, { backgroundColor: category.tint }]}>
                  <Ionicons name={category.icon} size={24} color={category.color} />
                </View>
                <AppText variant="caption" align="center" numberOfLines={2}>
                  {category.label}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>

        {servicesQuery.isLoading ? (
          <LoadingState message="Loading services..." />
        ) : servicesQuery.isError && !servicesQuery.data ? (
          <ErrorState
            message={getErrorMessage(servicesQuery.error)}
            onRetry={() => servicesQuery.refetch()}
            retrying={servicesQuery.isFetching}
          />
        ) : services.length === 0 ? (
          <AppText color="textSecondary" align="center">
            No services have been listed yet. Check back soon.
          </AppText>
        ) : (
          <>
            <View style={styles.section}>
              <SectionHeader title="Near you" />
              {location.coords ? (
                nearby.length > 0 ? (
                  nearby.map(({ service, distance }) => (
                    <ServiceCard key={service.serviceId} service={service} distanceKm={distance} />
                  ))
                ) : (
                  <AppText color="textSecondary">
                    No providers have pinned a location within {NEARBY_RADIUS_KM} km of you yet.
                  </AppText>
                )
              ) : (
                <View style={styles.nearbyPrompt}>
                  <View style={styles.nearbyIcon}>
                    <Ionicons name="navigate" size={22} color={colors.primary} />
                  </View>
                  <AppText variant="bodyStrong" align="center">
                    Find help close to home
                  </AppText>
                  <AppText color="textSecondary" align="center">
                    Share your location to see providers near you.
                  </AppText>
                  <AppButton
                    title="Show providers near me"
                    icon="navigate-outline"
                    onPress={location.requestLocation}
                    loading={location.status === 'locating'}
                  />
                  {location.message && (
                    <AppText variant="caption" color="warning" align="center">
                      {location.message}
                    </AppText>
                  )}
                </View>
              )}
            </View>

            {featured.length > 0 && (
              <View style={styles.section}>
                <SectionHeader title="Featured" />
                {featured.map((service) => (
                  <ServiceCard key={service.serviceId} service={service} />
                ))}
              </View>
            )}

            <View style={styles.section}>
              <SectionHeader
                title="Recently added"
                actionLabel="See all"
                onAction={() => router.navigate('/explore')}
              />
              {recent.map((service) => (
                <ServiceCard key={service.serviceId} service={service} />
              ))}
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.xl },
  greetingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  slogan: { gap: spacing.xxs },
  avatarRing: {
    padding: 2,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.lg },
  categoryTile: { width: '33.33%', alignItems: 'center', gap: spacing.xs },
  categoryIcon: {
    width: 58,
    height: 58,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  section: { gap: spacing.md },
  nearbyPrompt: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  nearbyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
