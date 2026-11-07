import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '@/theme';

interface HeaderBannerProps {
  children: ReactNode;
  style?: ViewStyle;
}

/**
 * Full-width forest-green header with rounded bottom corners. It extends behind the
 * status bar, so the screen using it should not inset the top edge itself
 * (use `<Screen edges={[]} padded={false}>`). While the screen is focused the
 * status bar icons switch to white so they stay readable on the green.
 */
export function HeaderBanner({ children, style }: HeaderBannerProps) {
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, []),
  );

  return (
    <View style={[styles.banner, { paddingTop: insets.top + spacing.lg }, style]}>
      {/* Soft gold glow in the corner, a nod to the PNG flag colours. */}
      <View style={styles.glow} pointerEvents="none" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    gap: spacing.lg,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.accentGold,
    opacity: 0.16,
  },
});
