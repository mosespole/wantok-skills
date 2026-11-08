import { router } from 'expo-router';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MyServiceItem } from '@/components/cards/MyServiceItem';
import {
  AppButton,
  AppText,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/common';
import { FormError } from '@/components/forms/FormError';
import { useDeleteListingFlow } from '@/hooks/useDeleteListingFlow';
import { useMyServices } from '@/hooks/useServices';
import { colors, spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';

import { t, tCount } from '@/i18n';
export default function MyServicesScreen() {
  const servicesQuery = useMyServices();
  const deleteFlow = useDeleteListingFlow();

  const goToCreate = () => router.push('/create-service');

  let body;
  if (servicesQuery.isLoading) {
    body = <LoadingState message={t('myServices.loading')} />;
  } else if (servicesQuery.isError) {
    body = (
      <ErrorState
        message={getErrorMessage(servicesQuery.error)}
        onRetry={() => servicesQuery.refetch()}
        retrying={servicesQuery.isFetching}
      />
    );
  } else {
    body = (
      <FlatList
        data={servicesQuery.data ?? []}
        keyExtractor={(item) => item.serviceId}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={servicesQuery.isRefetching}
            onRefresh={() => servicesQuery.refetch()}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="briefcase-outline"
            title={t('myServices.emptyTitle')}
            message={t('myServices.emptyMessage')}
            actionLabel={t('common.createListing')}
            onAction={goToCreate}
          />
        }
        renderItem={({ item }) => (
          <MyServiceItem
            listing={item}
            onView={() =>
              router.push({ pathname: '/service/[id]', params: { id: item.serviceId } })
            }
            onEdit={() =>
              router.push({ pathname: '/edit-service/[id]', params: { id: item.serviceId } })
            }
            onDelete={() => deleteFlow.requestDelete(item)}
          />
        )}
      />
    );
  }

  const count = servicesQuery.data?.length ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="title">{t('tabs.myServices')}</AppText>
          {servicesQuery.isSuccess && (
            <AppText variant="caption" color="textSecondary">
              {tCount('common.listings', count)}
            </AppText>
          )}
        </View>
        <AppButton title={t('myServices.new')} icon="add" onPress={goToCreate} fullWidth={false} />
      </View>

      {deleteFlow.error && (
        <View style={styles.errorBanner}>
          <FormError message={deleteFlow.error} />
        </View>
      )}

      {body}

      <ConfirmDialog
        visible={deleteFlow.target !== null}
        title={t('listing.deleteTitle')}
        message={t('listing.deleteMessage', { title: deleteFlow.target?.title ?? '' })}
        confirmLabel={t('common.delete')}
        destructive
        loading={deleteFlow.isDeleting}
        onConfirm={deleteFlow.confirmDelete}
        onCancel={deleteFlow.cancelDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerText: { flex: 1 },
  errorBanner: { paddingHorizontal: spacing.lg },
  list: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.sm },
  separator: { height: spacing.md },
});
