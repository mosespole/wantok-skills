import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Card } from '@/components/common';
import { getCategoryLabel } from '@/constants/categories';
import { colors, radius, spacing } from '@/theme';
import type { ServiceListing } from '@/types/service';
import { formatPrice, formatRelativeDate } from '@/utils/formatting';

interface MyServiceItemProps {
  listing: ServiceListing;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** A provider's own listing, with edit and delete actions. */
export function MyServiceItem({ listing, onView, onEdit, onDelete }: MyServiceItemProps) {
  return (
    <Card onPress={onView} accessibilityLabel={`View ${listing.title}`} style={styles.card}>
      <View style={styles.topRow}>
        <AppText variant="bodyStrong" style={styles.title} numberOfLines={2}>
          {listing.title}
        </AppText>
        <View style={[styles.badge, !listing.isActive && styles.badgePaused]}>
          <AppText variant="caption" color={listing.isActive ? 'success' : 'warning'}>
            {listing.isActive ? 'Active' : 'Paused'}
          </AppText>
        </View>
      </View>

      <AppText variant="caption" color="textSecondary">
        {getCategoryLabel(listing.category)} · {formatPrice(listing.startingPrice)}
      </AppText>
      {listing.updatedAt && (
        <AppText variant="caption" color="textMuted">
          Updated {formatRelativeDate(listing.updatedAt)}
        </AppText>
      )}

      <View style={styles.actions}>
        <Pressable
          onPress={onEdit}
          style={styles.action}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${listing.title}`}
        >
          <Ionicons name="create-outline" size={18} color={colors.primary} />
          <AppText variant="label" color="primary">
            Edit
          </AppText>
        </Pressable>
        <Pressable
          onPress={onDelete}
          style={styles.action}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${listing.title}`}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <AppText variant="label" color="error">
            Delete
          </AppText>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.xs },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  title: { flex: 1 },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
    backgroundColor: colors.successLight,
  },
  badgePaused: { backgroundColor: colors.warningLight },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.xl,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  action: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
