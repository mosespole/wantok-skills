import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common';
import { colors, radius, spacing } from '@/theme';
import type { UserRole } from '@/types/user';

const OPTIONS: {
  role: UserRole;
  title: string;
  description: string;
  icon: ComponentProps<typeof Ionicons>['name'];
}[] = [
  {
    role: 'customer',
    title: 'Customer',
    description: 'Find and contact skilled people',
    icon: 'search',
  },
  {
    role: 'provider',
    title: 'Service Provider',
    description: 'Advertise my skills and services',
    icon: 'construct',
  },
];

interface RoleSelectorProps {
  value: UserRole | undefined;
  onChange: (role: UserRole) => void;
  error?: string;
}

export function RoleSelector({ value, onChange, error }: RoleSelectorProps) {
  return (
    <View style={styles.wrapper}>
      <AppText variant="label" color="textSecondary">
        I want to join as a
      </AppText>
      <View style={styles.row} accessibilityRole="radiogroup">
        {OPTIONS.map((option) => {
          const selected = value === option.role;
          return (
            <Pressable
              key={option.role}
              onPress={() => onChange(option.role)}
              style={[styles.option, selected && styles.optionSelected]}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`${option.title}: ${option.description}`}
            >
              <Ionicons
                name={option.icon}
                size={24}
                color={selected ? colors.primary : colors.textMuted}
              />
              <AppText variant="bodyStrong" color={selected ? 'primary' : 'textPrimary'}>
                {option.title}
              </AppText>
              <AppText variant="caption" color="textSecondary">
                {option.description}
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
  row: { flexDirection: 'row', gap: spacing.md },
  option: {
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
});
