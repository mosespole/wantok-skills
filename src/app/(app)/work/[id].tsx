import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
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

  if (itemQuery.isLoading) return <LoadingState message="Loading project..." />;
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
        title="Project not found"
        message="It may have been removed by the provider."
        actionLabel="Go back"
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
          text={`Completed ${format(item.completedAt, 'd MMMM yyyy')}`}
        />
        {item.locationName !== '' && <Detail icon="location-outline" text={item.locationName} />}
      </Card>
      {isOwner ? (
        <AppButton
          title="Edit project"
          icon="create-outline"
          onPress={() => router.push({ pathname: '/edit-work/[id]', params: { id: item.itemId } })}
        />
      ) : (
        <AppButton
          title="View provider"
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
