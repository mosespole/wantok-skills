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
      // Android's default "highQuality" line breaking can measure a line narrower than it
      // draws when the phone uses a custom system font (e.g. Samsung font styles), which
      // pushes the last word onto a hidden line ("Computer Repair" showed as "Computer").
      textBreakStrategy="simple"
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
