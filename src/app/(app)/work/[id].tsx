import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppButton,
  AppText,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
} from '@/components/common';
import { getCategoryLabel } from '@/constants/categories';
import { useAuth } from '@/hooks/useAuth';
import { usePortfolioItem } from '@/hooks/usePortfolio';
import { colors, radius, spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';
import { formatDate } from '@/utils/formatting';

import { t } from '@/i18n';
function Detail({ icon, text }: { icon: ComponentProps<typeof Ionicons>['name']; text: string }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <AppText style={styles.flex}>{text}</AppText>
    </View>
  );
}

/** One past-work project in full: photo, caption, category, location and completion date. */
export default function WorkDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const itemQuery = usePortfolioItem(id ?? '');
  const item = itemQuery.data;

  if (itemQuery.isLoading) return <LoadingState message={t('work.loading')} />;
  if (itemQuery.isError) {
    return (
      <ErrorState
        message={getErrorMessage(itemQuery.error)}
        onRetry={() => itemQuery.refetch()}
        retrying={itemQuery.isFetching}
      />
    );
  }
  if (!item) {
    return (
      <EmptyState
        icon="images-outline"
        title={t('work.notFoundTitle')}
        message={t('common.removedByProvider')}
        actionLabel={t('common.goBack')}
        onAction={() => router.back()}
      />
    );
  }

  const isOwner = user?.uid === item.providerId;

  return (
    <Screen edges={['bottom']}>
      <Image
        source={{ uri: item.imageData }}
        style={styles.photo}
        contentFit="contain"
        accessibilityLabel={item.caption}
      />
      <AppText variant="title">{item.caption}</AppText>
      <Card style={styles.card}>
        <Detail icon="pricetag-outline" text={getCategoryLabel(item.category)} />
        <Detail
          icon="calendar-outline"
          text={t('work.completed', { date: formatDate(item.completedAt) })}
        />
        {item.locationName !== '' && <Detail icon="location-outline" text={item.locationName} />}
      </Card>
      {isOwner ? (
        <AppButton
          title={t('screens.editProject')}
          icon="create-outline"
          onPress={() => router.push({ pathname: '/edit-work/[id]', params: { id: item.itemId } })}
        />
      ) : (
        <AppButton
          title={t('work.viewProvider')}
          icon="person-outline"
          variant="secondary"
          onPress={() =>
            router.push({ pathname: '/provider/[id]', params: { id: item.providerId } })
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  photo: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
  },
  card: { gap: spacing.md },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
