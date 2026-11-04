import { Ionicons } from '@expo/vector-icons';
import { useImperativeHandle } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common';
import { colors, spacing } from '@/theme';

import type { ProviderMapProps } from './ProviderMap';

/**
 * Web fallback. react-native-maps only supports Android and iOS, so the browser
 * build shows a message instead of crashing. Wantok Skills targets Android.
 */
export function ProviderMap({ pins, ref }: ProviderMapProps) {
  useImperativeHandle(ref, () => ({ centreOn: () => undefined, fitTo: () => undefined }));

  return (
    <View style={styles.container}>
      <Ionicons name="map-outline" size={48} color={colors.primary} />
      <AppText variant="subtitle" align="center">
        The map is available in the mobile app
      </AppText>
      <AppText color="textSecondary" align="center">
        Open Wantok Skills on your Android phone to see {pins.length}{' '}
        {pins.length === 1 ? 'provider' : 'providers'} on the map.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.primaryLight,
  },
});
