import { use, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { HeaderHeightContext } from 'expo-router/react-navigation';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

interface ScreenProps {
  children: ReactNode;
  /** Wrap content in a ScrollView. Disable for screens that render their own FlatList or a map. */
  scroll?: boolean;
  /** Pad the content horizontally and vertically. */
  padded?: boolean;
  /** Which safe-area edges to inset. Screens under a header or tab bar usually omit 'top'/'bottom'. */
  edges?: Edge[];
  refreshing?: boolean;
  onRefresh?: () => void;
  contentStyle?: ViewStyle;
  backgroundColor?: string;
}

/**
 * Base layout for every screen: safe-area insets, keyboard avoidance and
 * optional scrolling, so these concerns are handled in one place.
 */
export function Screen({
  children,
  scroll = true,
  padded = true,
  edges = ['top', 'bottom'],
  refreshing,
  onRefresh,
  contentStyle,
  backgroundColor = colors.background,
}: ScreenProps) {
  const padding = padded ? styles.padded : undefined;
  // Height of the navigation header above this screen (0 when there is none).
  const headerHeight = use(HeaderHeightContext) ?? 0;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor }]} edges={edges}>
      <KeyboardAvoidingView
        style={styles.flex}
        // Expo Android apps draw edge-to-edge, so the window does not resize for the
        // keyboard; 'padding' lifts inputs above it on both Android and iOS.
        behavior="padding"
        keyboardVerticalOffset={headerHeight}
      >
        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[styles.grow, padding, contentStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={refreshing ?? false}
                  onRefresh={onRefresh}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              ) : undefined
            }
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, padding, contentStyle]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  grow: { flexGrow: 1 },
  padded: { padding: spacing.lg, gap: spacing.lg },
});
