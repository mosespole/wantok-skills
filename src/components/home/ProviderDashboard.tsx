import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Avatar, Card, ErrorState, Screen, SectionHeader } from '@/components/common';
import { getCategoryLabel } from '@/constants/categories';
import { STORAGE_ENABLED } from '@/constants/features';
import { useAuth } from '@/hooks/useAuth';
import { useMyServices } from '@/hooks/useServices';
import { colors, radius, spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';

type IconName = ComponentProps<typeof Ionicons>['name'];

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card style={styles.statTile}>
      <AppText variant="display" color="primary">
        {value}
      </AppText>
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
    </Card>
  );
}

function ActionRow({ icon, title, href }: { icon: IconName; title: string; href: Href }) {
  return (
    <Pressable
      onPress={() => router.push(href)}
      style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.actionIcon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <AppText variant="bodyStrong" style={styles.flex}>
        {title}
      </AppText>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

/** Provider Dashboard: profile summary, listing counts and shortcuts. */
export function ProviderDashboard() {
  const { profile } = useAuth();
  const servicesQuery = useMyServices();

  if (!profile) return null;

  const listings = servicesQuery.data ?? [];
  const activeCount = listings.filter((listing) => listing.isActive).length;
  const pausedCount = listings.length - activeCount;
  const countText = (count: number) => (servicesQuery.isSuccess ? String(count) : '–');

  // Prompt providers to complete the profile details customers rely on.
  const missing = [
    STORAGE_ENABLED && !profile.profileImageUrl && 'a profile photo',
    !profile.bio && 'a short bio',
    !profile.skillCategory && 'your main skill',
    profile.latitude === null && 'your map location',
  ].filter((item): item is string => Boolean(item));

  return (
    <Screen
      edges={['top']}
      onRefresh={() => servicesQuery.refetch()}
      refreshing={servicesQuery.isRefetching}
    >
      <AppText variant="title">Dashboard</AppText>

      <Card style={styles.profileCard}>
        <Avatar name={profile.fullName} imageUrl={profile.profileImageUrl} size={64} />
        <View style={styles.flex}>
          <AppText variant="subtitle">{profile.fullName}</AppText>
          <AppText variant="caption" color="primary">
            {profile.skillCategory ? getCategoryLabel(profile.skillCategory) : 'Service Provider'}
          </AppText>
          {profile.locationName !== '' && (
            <AppText variant="caption" color="textSecondary">
              {profile.locationName}
            </AppText>
          )}
        </View>
      </Card>

      {missing.length > 0 && (
        <Pressable
          onPress={() => router.push('/edit-profile')}
          style={styles.tip}
          accessibilityRole="button"
        >
          <Ionicons name="sparkles-outline" size={20} color={colors.warning} />
          <AppText variant="caption" style={styles.flex}>
            Customers trust complete profiles. Add {missing.join(', ')}.
          </AppText>
        </Pressable>
      )}

      {servicesQuery.isError && !servicesQuery.data ? (
        <ErrorState
          message={getErrorMessage(servicesQuery.error)}
          onRetry={() => servicesQuery.refetch()}
          retrying={servicesQuery.isFetching}
        />
      ) : (
        <View style={styles.stats}>
          <StatTile label="Active listings" value={countText(activeCount)} />
          <StatTile label="Paused" value={countText(pausedCount)} />
        </View>
      )}

      <View>
        <SectionHeader title="Manage" />
        <Card style={styles.actions}>
          <ActionRow icon="add-circle-outline" title="Create a listing" href="/create-service" />
          <ActionRow icon="briefcase-outline" title="Manage my services" href="/my-services" />
          <ActionRow icon="person-circle-outline" title="Edit my profile" href="/edit-profile" />
          <ActionRow icon="search-outline" title="Browse the marketplace" href="/search" />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.accentGoldLight,
  },
  stats: { flexDirection: 'row', gap: spacing.md },
  statTile: { flex: 1, gap: spacing.xxs },
  actions: { paddingVertical: spacing.xs },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
});
