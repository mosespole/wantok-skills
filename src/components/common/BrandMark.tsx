import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme';

/** App logo mark: a community icon on forest green with a gold accent bar. */
export function BrandMark({ size = 72 }: { size?: number }) {
  return (
    <View
      style={[styles.mark, { width: size, height: size, borderRadius: size * 0.28 }]}
      accessibilityLabel="Wantok Skills logo"
    >
      <Ionicons name="people" size={size * 0.5} color={colors.textOnPrimary} />
      <View style={[styles.accent, { height: size * 0.08 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  accent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.accentGold,
    borderBottomLeftRadius: radius.sm,
    borderBottomRightRadius: radius.sm,
  },
});
