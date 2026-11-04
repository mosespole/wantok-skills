import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme';

/** Thin horizontal bar for upload progress. `value` is between 0 and 1. */
export function ProgressBar({ value }: { value: number }) {
  const percent = Math.round(Math.min(Math.max(value, 0), 1) * 100);
  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: percent }}
    >
      <View style={[styles.fill, { width: `${percent}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: colors.primary },
});
