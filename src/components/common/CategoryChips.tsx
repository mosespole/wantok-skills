import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { CATEGORIES, getCategoryLabel } from '@/constants/categories';
import { colors, radius, spacing } from '@/theme';

import { AppText } from './AppText';

import { t } from '@/i18n';
interface CategoryChipsProps {
  /** Selected category ID, or undefined for "All". */
  value: string | undefined;
  onChange: (category: string | undefined) => void;
}

/** Horizontally scrolling single-select filter with an "All" option. */
export function CategoryChips({ value, onChange }: CategoryChipsProps) {
  const options = [{ id: undefined, label: t('common.all') }, ...CATEGORIES];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="tablist"
    >
      {options.map((option) => {
        const selected = value === option.id;
        return (
          <Pressable
            key={option.id ?? 'all'}
            onPress={() => onChange(option.id)}
            style={[styles.chip, selected && styles.selected]}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
          >
            <AppText variant="label" color={selected ? 'textOnPrimary' : 'textPrimary'}>
              {option.id ? getCategoryLabel(option.id) : option.label}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingHorizontal: spacing.lg },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
});
