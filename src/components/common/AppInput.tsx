import { Ionicons } from '@expo/vector-icons';
import { useState, type ComponentProps, type Ref } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

import { AppText } from './AppText';

import { t, tMessage } from '@/i18n';
interface AppInputProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
  /** Adds a show/hide toggle for password fields. */
  secureToggle?: boolean;
  optional?: boolean;
  ref?: Ref<TextInput>;
}

export function AppInput({
  label,
  error,
  icon,
  secureToggle = false,
  optional = false,
  multiline,
  style,
  ref,
  onFocus,
  onBlur,
  ...rest
}: AppInputProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureToggle);

  const borderColor = error ? colors.error : focused ? colors.primary : colors.border;

  return (
    <View style={styles.wrapper}>
      <AppText variant="label" color="textSecondary">
        {label}
        {optional && (
          <AppText variant="caption" color="textMuted">
            {' '}
            {t('common.optional')}
          </AppText>
        )}
      </AppText>
      <View style={[styles.field, multiline && styles.multilineField, { borderColor }]}>
        {icon && <Ionicons name={icon} size={20} color={colors.textMuted} />}
        <TextInput
          ref={ref}
          style={[styles.input, multiline && styles.multilineInput, style]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={hidden}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          accessibilityLabel={label}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...rest}
        />
        {secureToggle && (
          <Pressable
            onPress={() => setHidden((value) => !value)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={hidden ? t('auth.showPassword') : t('auth.hidePassword')}
          >
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        )}
      </View>
      {error ? (
        <AppText variant="caption" color="error">
          {tMessage(error)}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 50,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  multilineField: { alignItems: 'flex-start', paddingVertical: spacing.sm },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  multilineInput: { minHeight: 110 },
});
