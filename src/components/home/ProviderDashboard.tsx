import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  AppText,
  Avatar,
  Card,
  ErrorState,
  HeaderBanner,
  Screen,
  SectionHeader,
} from '@/components/common';
import { getCategoryLabel } from '@/constants/categories';
import { useAuth } from '@/hooks/useAuth';
import { useMyServices } from '@/hooks/useServices';
import { colors, radius, spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';

import { t } from '@/i18n';
type IconName = ComponentProps<typeof Ionicons>['name'];

function StatTile({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: IconName;
  tone: 'success' | 'warning';
}) {
  return (
    <Card style={styles.statTile}>
      <View
        style={[
          styles.statIcon,
          { backgroundColor: tone === 'success' ? colors.successLight : colors.warningLight },
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={tone === 'success' ? colors.success : colors.warning}
        />
      </View>
      <AppText variant="display">{value}</AppText>
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
    </Card>
  );
}

function ActionRow({
  icon,
  title,
  href,
  last = false,
}: {
  icon: IconName;
  title: string;
  href: Href;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={() => router.push(href)}
      style={({ pressed }) => [
        styles.actionRow,
        !last && styles.actionDivider,
        pressed && styles.pressed,
      ]}
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
    !profile.profileImageUrl && t('dashboard.missingPhoto'),
    !profile.bio && t('dashboard.missingBio'),
    !profile.skillCategory && t('dashboard.missingSkill'),
    profile.latitude === null && t('dashboard.missingLocation'),
  ].filter((item): item is string => Boolean(item));

  return (
    <Screen
      edges={[]}
      padded={false}
      onRefresh={() => servicesQuery.refetch()}
      refreshing={servicesQuery.isRefetching}
    >
      <HeaderBanner>
        <AppText variant="caption" color="textOnPrimaryMuted">
          {t('dashboard.label')}
        </AppText>
        <View style={styles.profileRow}>
          <View style={styles.avatarRing}>
            <Avatar name={profile.fullName} imageUrl={profile.profileImageUrl} size={60} />
          </View>
          <View style={styles.flex}>
            <AppText variant="title" color="textOnPrimary" numberOfLines={1}>
              {profile.fullName}
            </AppText>
            <View style={styles.skillChip}>
              <AppText variant="label" color="primary">
                {profile.skillCategory
                  ? getCategoryLabel(profile.skillCategory)
                  : t('roles.provider')}
              </AppText>
            </View>
            {profile.locationName !== '' && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={colors.textOnPrimaryMuted} />
                <AppText variant="caption" color="textOnPrimaryMuted" numberOfLines={1}>
                  {profile.locationName}
                </AppText>
              </View>
            )}
          </View>
        </View>
      </HeaderBanner>

      <View style={styles.content}>
        {missing.length > 0 && (
          <Pressable
            onPress={() => router.push('/edit-profile')}
            style={styles.tip}
            accessibilityRole="button"
          >
            <Ionicons name="sparkles-outline" size={20} color={colors.warning} />
            <AppText variant="caption" style={styles.flex}>
              {t('dashboard.completeProfile', { items: missing.join(', ') })}
            </AppText>
            <Ionicons name="chevron-forward" size={18} color={colors.warning} />
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
            <StatTile
              label={t('dashboard.active')}
              value={countText(activeCount)}
              icon="checkmark-circle"
              tone="success"
            />
            <StatTile
              label={t('dashboard.paused')}
              value={countText(pausedCount)}
              icon="pause-circle"
              tone="warning"
            />
          </View>
        )}

        <View>
          <SectionHeader title={t('dashboard.manage')} />
          <Card style={styles.actions}>
            <ActionRow
              icon="add-circle-outline"
              title={t('common.createListing')}
              href="/create-service"
            />
            <ActionRow
              icon="briefcase-outline"
              title={t('dashboard.manageServices')}
              href="/my-services"
            />
            <ActionRow icon="images-outline" title={t('dashboard.pastWork')} href="/my-work" />
            <ActionRow
              icon="person-circle-outline"
              title={t('dashboard.editProfile')}
              href="/edit-profile"
            />
            <ActionRow icon="search-outline" title={t('dashboard.browse')} href="/search" last />
          </Card>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.xl },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  avatarRing: {
    padding: 3,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  skillChip: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    marginTop: spacing.xs,
  },
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
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  actions: { paddingVertical: spacing.xs },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  actionDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
});
