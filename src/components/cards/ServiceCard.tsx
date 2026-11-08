import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, Avatar, Card } from '@/components/common';
import { RatingBadge } from '@/components/reviews/StarRating';
import { getCategoryLabel, getCategoryStyle } from '@/constants/categories';
import { colors, radius, spacing } from '@/theme';
import type { ServiceWithProvider } from '@/types/service';
import { formatPrice } from '@/utils/formatting';

import { t } from '@/i18n';
interface ServiceCardProps {
  service: ServiceWithProvider;
  /** Distance from the user in km, when known. */
  distanceKm?: number | null;
}

/**
 * Marketplace listing card used on Home, Explore and Search. Image first: the listing
 * photo when there is one, otherwise a band in the category's colour with its icon.
 */
export function ServiceCard({ service, distanceKm }: ServiceCardProps) {
  const category = getCategoryStyle(service.category);
  const providerName = service.provider?.fullName ?? t('services.providerFallback');
  const distanceText =
    distanceKm != null ? `${distanceKm < 1 ? '<1' : Math.round(distanceKm)} km` : null;

  return (
    <Card
      onPress={() => router.push({ pathname: '/service/[id]', params: { id: service.serviceId } })}
      accessibilityLabel={t('services.cardLabel', {
        title: service.title,
        provider: providerName,
        price: formatPrice(service.startingPrice),
      })}
      style={styles.card}
    >
      <View style={styles.media}>
        {service.imageUrl ? (
          <Image source={{ uri: service.imageUrl }} style={styles.photo} contentFit="cover" />
        ) : (
          <View style={[styles.photo, styles.placeholder, { backgroundColor: category.tint }]}>
            <Ionicons name={category.icon} size={34} color={category.color} />
          </View>
        )}
        <View style={styles.categoryChip}>
          <Ionicons name={category.icon} size={12} color={category.color} />
          <AppText variant="caption" style={{ color: category.color }} numberOfLines={1}>
            {getCategoryLabel(service.category)}
          </AppText>
        </View>
        {distanceText && (
          <View style={styles.distanceChip}>
            <Ionicons name="navigate" size={11} color={colors.textOnPrimary} />
            <AppText variant="caption" color="textOnPrimary">
              {distanceText}
            </AppText>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <AppText variant="subtitle" numberOfLines={2}>
          {service.title}
        </AppText>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <AppText variant="caption" color="textMuted" numberOfLines={1} style={styles.flex}>
            {service.locationName}
          </AppText>
        </View>

        <View style={styles.footer}>
          <View style={styles.provider}>
            <Avatar name={providerName} imageUrl={service.provider?.profileImageUrl} size={24} />
            <AppText variant="caption" color="textSecondary" numberOfLines={1} style={styles.flex}>
              {providerName}
            </AppText>
          </View>
          <RatingBadge rating={service.provider?.rating} />
        </View>

        <View style={styles.pricePill}>
          <AppText variant="label" color="primary">
            {formatPrice(service.startingPrice)}
          </AppText>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 0, overflow: 'hidden' },
  media: { position: 'relative' },
  photo: { width: '100%', height: 116 },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  categoryChip: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  distanceChip: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(21, 32, 26, 0.72)',
  },
  body: { padding: spacing.md, gap: spacing.xs },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  provider: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  flex: { flex: 1 },
  pricePill: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
  },
});
