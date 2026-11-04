import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius, spacing, type ColorName } from '@/theme';

import { AppText } from './AppText';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'whatsapp';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: ComponentProps<typeof Ionicons>['name'];
  /** While true the button shows a spinner and ignores taps, preventing double submissions. */
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
}

const variantStyles: Record<Variant, { background: string; border: string; text: ColorName }> = {
  primary: { background: colors.primary, border: colors.primary, text: 'textOnPrimary' },
  secondary: { background: colors.primaryLight, border: colors.primaryLight, text: 'primary' },
  outline: { background: 'transparent', border: colors.primary, text: 'primary' },
  ghost: { background: 'transparent', border: 'transparent', text: 'primary' },
  danger: { background: colors.error, border: colors.error, text: 'textOnPrimary' },
  whatsapp: { background: colors.whatsapp, border: colors.whatsapp, text: 'textOnPrimary' },
};

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  accessibilityHint,
}: AppButtonProps) {
  const palette = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: palette.background, borderColor: palette.border },
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors[palette.text]} />
      ) : (
        <View style={styles.content}>
          {icon && <Ionicons name={icon} size={20} color={colors[palette.text]} />}
          <AppText variant="button" color={palette.text}>
            {title}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.55 },
});
