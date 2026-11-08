import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme';

import { t } from '@/i18n';
interface BrandMarkProps {
  size?: number;
  /** White tile with a green icon, for use on the green header banners. */
  inverted?: boolean;
}

/** App logo mark: a community icon on forest green with a gold accent bar. */
export function BrandMark({ size = 72, inverted = false }: BrandMarkProps) {
  return (
    <View
      style={[
        styles.mark,
        { width: size, height: size, borderRadius: size * 0.28 },
        inverted && styles.inverted,
      ]}
      accessibilityLabel={t('a11y.logo')}
    >
      <Ionicons
        name="people"
        size={size * 0.5}
        color={inverted ? colors.primary : colors.textOnPrimary}
      />
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
  inverted: { backgroundColor: colors.surface },
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
