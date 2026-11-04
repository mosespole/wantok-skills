import { Pressable, StyleSheet, View } from 'react-native';

import { spacing } from '@/theme';

import { AppText } from './AppText';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Heading for a block of content, with an optional "See all" style link. */
export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <AppText variant="subtitle" accessibilityRole="header">
        {title}
      </AppText>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="link">
          <AppText variant="label" color="primary">
            {actionLabel}
          </AppText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
});
