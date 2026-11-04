import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, Avatar, Card } from '@/components/common';
import { CATEGORIES, getCategoryLabel } from '@/constants/categories';
import { colors, radius, spacing } from '@/theme';
import type { ServiceWithProvider } from '@/types/service';
import { formatPrice } from '@/utils/formatting';

interface ServiceCardProps {
  service: ServiceWithProvider;
  /** Distance from the user in km, when known. */
  distanceKm?: number | null;
}

/** Marketplace listing card used on Home, Explore and Search. Opens the listing details. */
export function ServiceCard({ service, distanceKm }: ServiceCardProps) {
  const icon =
    CATEGORIES.find((category) => category.id === service.category)?.icon ?? 'construct-outline';
  const providerName = service.provider?.fullName ?? 'Wantok Skills provider';

  return (
    <Card
      onPress={() => router.push({ pathname: '/service/[id]', params: { id: service.serviceId } })}
      accessibilityLabel={`${service.title} by ${providerName}, ${formatPrice(service.startingPrice)}`}
      style={styles.card}
    >
      {service.imageUrl ? (
        <Image source={{ uri: service.imageUrl }} style={styles.thumb} contentFit="cover" />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]}>
          <Ionicons name={icon} size={28} color={colors.primary} />
        </View>
      )}

      <View style={styles.body}>
        <AppText variant="caption" color="primary" numberOfLines={1}>
          {getCategoryLabel(service.category)}
        </AppText>
        <AppText variant="bodyStrong" numberOfLines={2}>
          {service.title}
        </AppText>
        <View style={styles.providerRow}>
          <Avatar name={providerName} imageUrl={service.provider?.profileImageUrl} size={20} />
          <AppText variant="caption" color="textSecondary" numberOfLines={1} style={styles.flex}>
            {providerName}
          </AppText>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <AppText variant="caption" color="textMuted" numberOfLines={1} style={styles.flex}>
            {service.locationName}
            {distanceKm != null ? ` · ${distanceKm < 1 ? '<1' : Math.round(distanceKm)} km` : ''}
          </AppText>
        </View>
        <AppText variant="label" color="primary">
          {formatPrice(service.startingPrice)}
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: spacing.md, padding: spacing.md },
  thumb: { width: 88, height: 88, borderRadius: radius.md },
  thumbPlaceholder: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: spacing.xxs },
  providerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
  flex: { flex: 1 },
});
