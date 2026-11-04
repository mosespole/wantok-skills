import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors, typography, type ColorName, type TypographyVariant } from '@/theme';

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: ColorName;
  align?: 'left' | 'center' | 'right';
}

/** Text that always uses a named typography style and theme colour. */
export function AppText({
  variant = 'body',
  color = 'textPrimary',
  align,
  style,
  ...rest
}: AppTextProps) {
  return (
    <Text
      style={[typography[variant], { color: colors[color] }, align && styles[align], style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  left: { textAlign: 'left' },
  center: { textAlign: 'center' },
  right: { textAlign: 'right' },
});
