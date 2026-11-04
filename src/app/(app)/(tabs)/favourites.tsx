import { router } from 'expo-router';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProviderCard } from '@/components/cards/ProviderCard';
import { AppText, EmptyState, ErrorState, LoadingState } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { useFavouriteProviders, useFavourites } from '@/hooks/useFavourites';
import { colors, spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';

/** Saved providers, stored in Firestore against the signed-in account. */
export default function FavouritesScreen() {
  const { profile } = useAuth();
  const providersQuery = useFavouriteProviders();
  // Hide providers that were just un-hearted, before the list refetches.
  const { favouriteIds, isLoading: idsLoading } = useFavourites();

  const allProviders = providersQuery.data ?? [];
  const providers = idsLoading
    ? allProviders
    : allProviders.filter((provider) => favouriteIds.has(provider.uid));

  let body;
  if (providersQuery.isLoading) {
    body = <LoadingState message="Loading favourites..." />;
  } else if (providersQuery.isError) {
    body = (
      <ErrorState
        message={getErrorMessage(providersQuery.error)}
        onRetry={() => providersQuery.refetch()}
        retrying={providersQuery.isFetching}
      />
    );
  } else {
    body = (
      <FlatList
        data={providers}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={providersQuery.isRefetching}
            onRefresh={() => providersQuery.refetch()}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title="No favourites yet"
            message="Tap the heart on a provider's profile to save them here."
            actionLabel={profile?.role === 'provider' ? undefined : 'Explore services'}
            onAction={() => router.navigate('/explore')}
          />
        }
        renderItem={({ item }) => <ProviderCard provider={item} />}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <AppText variant="title">Favourites</AppText>
      </View>
      {body}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  list: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.sm },
  separator: { height: spacing.md },
});
