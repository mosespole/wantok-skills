import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import type { DataSource } from '@/services/cache/activeServicesCache';
import { colors, radius, spacing } from '@/theme';
import { formatRelativeDate } from '@/utils/formatting';

import { AppText } from './AppText';

import { t } from '@/i18n';
interface DataStatusNoticeProps {
  source: DataSource | undefined;
  updatedAt: Date | undefined;
  onRetry?: () => void;
}

/**
 * Tells the user when the listings on screen are a saved copy rather than live
 * Firestore data, or when the phone is offline. Shows nothing when all is well.
 */
export function DataStatusNotice({ source, updatedAt, onRetry }: DataStatusNoticeProps) {
  const { isOffline } = useNetworkStatus();
  const showingSaved = source === 'cache';
  if (!isOffline && !showingSaved) return null;

  const title = isOffline ? t('status.offline') : t('status.serverUnreachable');
  const detail = showingSaved
    ? t('status.showingSaved', { when: formatRelativeDate(updatedAt ?? null) })
    : t('status.showingLatest');

  return (
    <View style={styles.notice} accessibilityRole="alert">
      <Ionicons name="cloud-offline-outline" size={20} color={colors.warning} />
      <View style={styles.text}>
        <AppText variant="label" color="warning">
          {title}
        </AppText>
        <AppText variant="caption" color="textSecondary">
          {detail}
        </AppText>
      </View>
      {onRetry && !isOffline && (
        <Pressable onPress={onRetry} hitSlop={8} accessibilityRole="button">
          <AppText variant="label" color="primary">
            {t('common.retry')}
          </AppText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.warningLight,
  },
  text: { flex: 1, gap: spacing.xxs },
});
