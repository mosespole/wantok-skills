import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common';
import { colors, spacing } from '@/theme';
import type { RatingSummary } from '@/types/review';

const STARS = [1, 2, 3, 4, 5];

/** Read-only stars. Half stars are shown for averages such as 4.5. */
export function StarRating({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <View style={styles.row} accessibilityLabel={`${value.toFixed(1)} out of 5 stars`}>
      {STARS.map((star) => {
        const name = value >= star ? 'star' : value >= star - 0.5 ? 'star-half' : 'star-outline';
        return <Ionicons key={star} name={name} size={size} color={colors.accentGold} />;
      })}
    </View>
  );
}

/** Tappable 1–5 stars for writing a review. */
export function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (stars: number) => void;
}) {
  return (
    <View style={styles.row} accessibilityRole="adjustable" accessibilityLabel="Your rating">
      {STARS.map((star) => (
        <Pressable
          key={star}
          onPress={() => onChange(star)}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`${star} ${star === 1 ? 'star' : 'stars'}`}
          accessibilityState={{ selected: value >= star }}
        >
          <Ionicons
            name={value >= star ? 'star' : 'star-outline'}
            size={34}
            color={colors.accentGold}
          />
        </Pressable>
      ))}
    </View>
  );
}

/** Compact "★ 4.6 (12)" label for cards. Shows "New" when there are no reviews yet. */
export function RatingBadge({ rating }: { rating: RatingSummary | null | undefined }) {
  if (!rating) return null;
  if (rating.count === 0 || rating.average === null) {
    return (
      <AppText variant="caption" color="textMuted">
        No reviews yet
      </AppText>
    );
  }
  return (
    <View
      style={styles.badge}
      accessibilityLabel={`Rated ${rating.average.toFixed(1)} out of 5 from ${rating.count} ${rating.count === 1 ? 'review' : 'reviews'}`}
    >
      <Ionicons name="star" size={14} color={colors.accentGold} />
      <AppText variant="label">{rating.average.toFixed(1)}</AppText>
      <AppText variant="caption" color="textMuted">
        ({rating.count})
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xxs },
  badge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
});
