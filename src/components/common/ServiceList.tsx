import type { ReactElement } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { ServiceCard } from '@/components/cards/ServiceCard';
import type { UseQueryResult } from '@tanstack/react-query';
import { colors, spacing } from '@/theme';
import type { ServiceWithProvider } from '@/types/service';
import { getErrorMessage } from '@/utils/errors';

import { EmptyState, ErrorState, LoadingState } from './StateViews';

interface ServiceListProps {
  query: UseQueryResult<ServiceWithProvider[]>;
  /** The listings to show after filtering `query.data`. */
  services: ServiceWithProvider[];
  emptyTitle: string;
  emptyMessage: string;
  header?: ReactElement;
}

/** Listing results with loading, error, empty and pull-to-refresh handled consistently. */
export function ServiceList({
  query,
  services,
  emptyTitle,
  emptyMessage,
  header,
}: ServiceListProps) {
  if (query.isLoading) return <LoadingState message="Loading services..." />;
  if (query.isError && !query.data) {
    return (
      <ErrorState
        message={getErrorMessage(query.error)}
        onRetry={() => query.refetch()}
        retrying={query.isFetching}
      />
    );
  }

  return (
    <FlatList
      data={services}
      keyExtractor={(item) => item.serviceId}
      contentContainerStyle={styles.list}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      ListHeaderComponent={header}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      refreshControl={
        <RefreshControl
          refreshing={query.isRefetching}
          onRefresh={() => query.refetch()}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      ListEmptyComponent={
        <EmptyState icon="search-outline" title={emptyTitle} message={emptyMessage} />
      }
      renderItem={({ item }) => <ServiceCard service={item} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.sm },
  separator: { height: spacing.md },
});
