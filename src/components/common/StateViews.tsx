import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';

import { AppButton } from './AppButton';
import { AppText } from './AppText';

type IconName = ComponentProps<typeof Ionicons>['name'];

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={colors.primary} />
      <AppText color="textSecondary" align="center">
        {message}
      </AppText>
    </View>
  );
}

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  message,
  icon = 'file-tray-outline',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={36} color={colors.primary} />
      </View>
      <AppText variant="subtitle" align="center">
        {title}
      </AppText>
      {message && (
        <AppText color="textSecondary" align="center">
          {message}
        </AppText>
      )}
      {actionLabel && onAction && (
        <AppButton title={actionLabel} onPress={onAction} variant="secondary" fullWidth={false} />
      )}
    </View>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
}

export function ErrorState({ message, onRetry, retrying }: ErrorStateProps) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <View style={[styles.iconCircle, styles.errorCircle]}>
        <Ionicons name="cloud-offline-outline" size={36} color={colors.error} />
      </View>
      <AppText variant="subtitle" align="center">
        Something went wrong
      </AppText>
      <AppText color="textSecondary" align="center">
        {message}
      </AppText>
      {onRetry && (
        <AppButton
          title="Try again"
          icon="refresh"
          onPress={onRetry}
          loading={retrying}
          variant="outline"
          fullWidth={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  errorCircle: { backgroundColor: colors.errorLight },
});
