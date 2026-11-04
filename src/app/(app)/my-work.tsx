import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import {
  AppButton,
  AppText,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
} from '@/components/common';
import { PortfolioGallery } from '@/components/portfolio/PortfolioGallery';
import { useAuth } from '@/hooks/useAuth';
import { usePortfolio } from '@/hooks/usePortfolio';
import { MAX_PORTFOLIO_ITEMS } from '@/services/firebase/portfolioService';
import { getErrorMessage } from '@/utils/errors';

/** Provider's own past-work gallery: add new projects, tap one to view or edit it. */
export default function MyWorkScreen() {
  const { user } = useAuth();
  const portfolioQuery = usePortfolio(user?.uid ?? '');
  const items = portfolioQuery.data ?? [];
  const isFull = items.length >= MAX_PORTFOLIO_ITEMS;

  if (portfolioQuery.isLoading) return <LoadingState message="Loading your past work..." />;
  if (portfolioQuery.isError) {
    return (
      <ErrorState
        message={getErrorMessage(portfolioQuery.error)}
        onRetry={() => portfolioQuery.refetch()}
        retrying={portfolioQuery.isFetching}
      />
    );
  }

  return (
    <Screen
      edges={['bottom']}
      onRefresh={() => portfolioQuery.refetch()}
      refreshing={portfolioQuery.isRefetching}
    >
      <View style={styles.header}>
        <AppText color="textSecondary" style={styles.flex}>
          {items.length} of {MAX_PORTFOLIO_ITEMS} projects. Customers see these on your profile.
        </AppText>
      </View>
      <AppButton
        title={isFull ? 'Gallery full: delete a project to add more' : 'Add a project'}
        icon="add"
        onPress={() => router.push('/add-work')}
        disabled={isFull}
      />
      {items.length === 0 ? (
        <EmptyState
          icon="images-outline"
          title="No past work yet"
          message="Add photos of jobs you have completed so customers can see the quality of your work."
        />
      ) : (
        <PortfolioGallery items={items} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center' },
});
