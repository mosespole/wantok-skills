import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppText } from '@/components/common';
import { useCurrentLocation } from '@/hooks/useLocation';
import type { Coordinates } from '@/services/location/locationService';
import { colors, radius, spacing } from '@/theme';

interface LocationFieldProps {
  coords: Coordinates | null;
  /** Called with real device coordinates and, when available, a place name. */
  onLocated: (coords: Coordinates, placeName: string | null) => void;
  onClear: () => void;
}

/**
 * Lets a provider attach their real GPS position so they appear on the map.
 * Coordinates are optional: a denied permission never blocks the form.
 */
export function LocationField({ coords, onLocated, onClear }: LocationFieldProps) {
  const location = useCurrentLocation();

  const handlePress = async () => {
    const result = await location.requestLocation();
    if (result) onLocated(result.coords, result.placeName);
  };

  return (
    <View style={styles.wrapper}>
      <AppText variant="label" color="textSecondary">
        Map position{' '}
        <AppText variant="caption" color="textMuted">
          (optional)
        </AppText>
      </AppText>

      {coords ? (
        <View style={styles.saved}>
          <Ionicons name="location" size={20} color={colors.success} />
          <AppText style={styles.savedText} variant="caption">
            Pinned at {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
          </AppText>
          <Pressable
            onPress={onClear}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Remove map position"
          >
            <Ionicons name="close-circle" size={22} color={colors.textMuted} />
          </Pressable>
        </View>
      ) : (
        <AppText variant="caption" color="textMuted">
          Add your current location so customers can find you on the map.
        </AppText>
      )}

      <AppButton
        title={coords ? 'Update to my current location' : 'Use my current location'}
        icon="navigate-outline"
        variant="secondary"
        onPress={handlePress}
        loading={location.status === 'locating'}
      />

      {location.message && (
        <View style={styles.message}>
          <AppText variant="caption" color="warning">
            {location.message}
          </AppText>
          {location.status === 'permission-denied' && !location.canAskAgain && (
            <Pressable onPress={location.openSettings} accessibilityRole="link">
              <AppText variant="label" color="primary">
                Open Settings
              </AppText>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  saved: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.successLight,
  },
  savedText: { flex: 1 },
  message: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.warningLight,
  },
});
