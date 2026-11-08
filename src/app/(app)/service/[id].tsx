import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppButton,
  AppText,
  Avatar,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
} from '@/components/common';
import { ContactButtons } from '@/components/common/ContactButtons';
import { FavouriteButton } from '@/components/common/FavouriteButton';
import { FormError } from '@/components/forms/FormError';
import { CATEGORIES, getCategoryLabel } from '@/constants/categories';
import { useAuth } from '@/hooks/useAuth';
import { useDeleteListingFlow } from '@/hooks/useDeleteListingFlow';
import { useService } from '@/hooks/useServices';
import { colors, radius, spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';
import { formatPrice, formatRelativeDate } from '@/utils/formatting';

import { t } from '@/i18n';
function DetailRow({
  icon,
  text,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  text: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <AppText style={styles.detailText}>{text}</AppText>
    </View>
  );
}

/** Listing details (READ). Customers see contact options; the owner sees edit/delete. */
export default function ServiceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const serviceQuery = useService(id ?? '');
  const deleteFlow = useDeleteListingFlow(() => router.back());

  const listing = serviceQuery.data;

  if (serviceQuery.isLoading) {
    return <LoadingState message={t('listing.loading')} />;
  }
  if (serviceQuery.isError) {
    return (
      <ErrorState
        message={getErrorMessage(serviceQuery.error)}
        onRetry={() => serviceQuery.refetch()}
        retrying={serviceQuery.isFetching}
      />
    );
  }
  if (!listing) {
    return (
      <EmptyState
        icon="search-outline"
        title={t('listing.notFoundTitle')}
        message={t('common.removedByProvider')}
        actionLabel={t('common.goBack')}
        onAction={() => router.back()}
      />
    );
  }

  const isOwner = user?.uid === listing.providerId;
  const provider = listing.provider;
  const categoryIcon =
    CATEGORIES.find((category) => category.id === listing.category)?.icon ?? 'construct-outline';

  return (
    <Screen
      edges={['bottom']}
      onRefresh={() => serviceQuery.refetch()}
      refreshing={serviceQuery.isRefetching}
    >
      <Stack.Screen
        options={{
          title: '',
          headerRight: provider
            ? () => <FavouriteButton providerId={provider.uid} providerName={provider.fullName} />
            : undefined,
        }}
      />

      {listing.imageUrl ? (
        <Image
          source={{ uri: listing.imageUrl }}
          style={styles.image}
          contentFit="cover"
          accessibilityLabel={t('listing.photoFor', { title: listing.title })}
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name={categoryIcon} size={48} color={colors.primary} />
        </View>
      )}

      <View style={styles.titleBlock}>
        <View style={styles.categoryChip}>
          <AppText variant="label" color="primary">
            {getCategoryLabel(listing.category)}
          </AppText>
        </View>
        <AppText variant="title">{listing.title}</AppText>
        <AppText variant="subtitle" color="primary">
          {formatPrice(listing.startingPrice)}
        </AppText>
        {isOwner && !listing.isActive && (
          <AppText variant="caption" color="warning">
            {t('listing.pausedNote')}
          </AppText>
        )}
      </View>

      <Card style={styles.section}>
        <DetailRow icon="location-outline" text={listing.locationName} />
        {listing.createdAt && (
          <DetailRow
            icon="time-outline"
            text={t('listing.posted', { when: formatRelativeDate(listing.createdAt) })}
          />
        )}
      </Card>

      <View style={styles.section}>
        <AppText variant="subtitle">{t('listing.about')}</AppText>
        <AppText color="textSecondary">{listing.description}</AppText>
      </View>

      {provider && (
        <Card
          style={styles.providerCard}
          onPress={
            isOwner
              ? undefined
              : () => router.push({ pathname: '/provider/[id]', params: { id: provider.uid } })
          }
          accessibilityLabel={t('common.viewProfileOf', { name: provider.fullName })}
        >
          <Avatar name={provider.fullName} imageUrl={provider.profileImageUrl} size={52} />
          <View style={styles.providerText}>
            <AppText variant="caption" color="textMuted">
              {t('listing.offeredBy')}
            </AppText>
            <AppText variant="bodyStrong">{provider.fullName}</AppText>
          </View>
          {!isOwner && <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />}
        </Card>
      )}

      {isOwner ? (
        <View style={styles.section}>
          <FormError message={deleteFlow.error} />
          <AppButton
            title={t('screens.editListing')}
            icon="create-outline"
            onPress={() =>
              router.push({ pathname: '/edit-service/[id]', params: { id: listing.serviceId } })
            }
          />
          <AppButton
            title={t('listing.delete')}
            icon="trash-outline"
            variant="ghost"
            onPress={() => deleteFlow.requestDelete(listing)}
          />
        </View>
      ) : (
        <ContactButtons
          phone={listing.contactNumber}
          whatsAppMessage={t('listing.whatsAppMessage', { title: listing.title })}
        />
      )}

      <ConfirmDialog
        visible={deleteFlow.target !== null}
        title={t('listing.deleteTitle')}
        message={t('listing.deleteMessage', { title: listing.title })}
        confirmLabel={t('common.delete')}
        destructive
        loading={deleteFlow.isDeleting}
        onConfirm={deleteFlow.confirmDelete}
        onCancel={deleteFlow.cancelDelete}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', aspectRatio: 16 / 10, borderRadius: radius.lg },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 16 / 7,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: { gap: spacing.xs },
  categoryChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
  },
  section: { gap: spacing.sm },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  detailText: { flex: 1 },
  providerCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  providerText: { flex: 1 },
});
