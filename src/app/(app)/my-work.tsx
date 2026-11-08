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

import { t } from '@/i18n';
/** Provider's own past-work gallery: add new projects, tap one to view or edit it. */
export default function MyWorkScreen() {
  const { user } = useAuth();
  const portfolioQuery = usePortfolio(user?.uid ?? '');
  const items = portfolioQuery.data ?? [];
  const isFull = items.length >= MAX_PORTFOLIO_ITEMS;

  if (portfolioQuery.isLoading) return <LoadingState message={t('myWork.loading')} />;
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
          {t('myWork.count', { count: items.length, max: MAX_PORTFOLIO_ITEMS })}
          {isFull ? ` ${t('myWork.fullHint')}` : ''}
        </AppText>
      </View>
      <AppButton
        // Kept short: button labels stay on one line, so a long label would be cut off.
        title={isFull ? t('myWork.full') : t('screens.addProject')}
        icon="add"
        onPress={() => router.push('/add-work')}
        disabled={isFull}
      />
      {items.length === 0 ? (
        <EmptyState
          icon="images-outline"
          title={t('myWork.emptyTitle')}
          message={t('myWork.emptyMessage')}
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
