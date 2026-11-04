import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

import { AppText } from './AppText';

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  /** When set, the bar is a button (e.g. on Home) that opens the Search screen. */
  onPress?: () => void;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search services or providers',
  onPress,
  autoFocus,
}: SearchBarProps) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.bar} accessibilityRole="search">
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <AppText color="textMuted">{placeholder}</AppText>
      </Pressable>
    );
  }

  return (
    <View style={styles.bar}>
      <Ionicons name="search" size={20} color={colors.textMuted} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        autoFocus={autoFocus}
        autoCorrect={false}
        returnKeyType="search"
        accessibilityRole="search"
        accessibilityLabel={placeholder}
      />
      {value ? (
        <Pressable
          onPress={() => onChangeText?.('')}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <Ionicons name="close-circle" size={20} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: { flex: 1, ...typography.body, color: colors.textPrimary, paddingVertical: spacing.sm },
});
