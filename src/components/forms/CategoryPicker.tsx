import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common';
import { CATEGORIES, type CategoryId } from '@/constants/categories';
import { colors, radius, spacing } from '@/theme';

interface CategoryPickerProps {
  label: string;
  value: CategoryId | undefined;
  onChange: (category: CategoryId) => void;
  error?: string;
}

/** Wrapping grid of category chips; exactly one can be selected. */
export function CategoryPicker({ label, value, onChange, error }: CategoryPickerProps) {
  return (
    <View style={styles.wrapper}>
      <AppText variant="label" color="textSecondary">
        {label}
      </AppText>
      <View style={styles.chips} accessibilityRole="radiogroup">
        {CATEGORIES.map((category) => {
          const selected = value === category.id;
          return (
            <Pressable
              key={category.id}
              onPress={() => onChange(category.id)}
              style={[styles.chip, selected && styles.chipSelected]}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={category.label}
            >
              <Ionicons
                name={category.icon}
                size={16}
                color={selected ? colors.textOnPrimary : colors.primary}
              />
              <AppText variant="label" color={selected ? 'textOnPrimary' : 'textPrimary'}>
                {category.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <AppText variant="caption" color="error">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
});
