import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import {
  AppText,
  Avatar,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  SectionHeader,
} from '@/components/common';
import { ContactButtons } from '@/components/common/ContactButtons';
import { FavouriteButton } from '@/components/common/FavouriteButton';
import { getCategoryLabel } from '@/constants/categories';
import { PortfolioGallery } from '@/components/portfolio/PortfolioGallery';
import { ReviewsSection } from '@/components/reviews/ReviewsSection';
import { RatingBadge } from '@/components/reviews/StarRating';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useProvider } from '@/hooks/useProvider';
import { useProviderServices } from '@/hooks/useServices';
import { colors, radius, spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';
import { formatPhone, formatPrice } from '@/utils/formatting';

import { t } from '@/i18n';
/** Provider Details: public profile, contact options, favourite toggle and their active listings. */
export default function ProviderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const providerId = id ?? '';
  const providerQuery = useProvider(providerId);
  const servicesQuery = useProviderServices(providerId);
  const portfolioQuery = usePortfolio(providerId);

  const provider = providerQuery.data;

  if (providerQuery.isLoading) return <LoadingState message={t('provider.loading')} />;
  if (providerQuery.isError) {
    return (
      <ErrorState
        message={getErrorMessage(providerQuery.error)}
        onRetry={() => providerQuery.refetch()}
        retrying={providerQuery.isFetching}
      />
    );
  }
  if (!provider) {
    return (
      <EmptyState
        icon="person-outline"
        title={t('provider.notFoundTitle')}
        message={t('provider.notFoundMessage')}
        actionLabel={t('common.goBack')}
        onAction={() => router.back()}
      />
    );
  }

  const listings = servicesQuery.data ?? [];

  return (
    <Screen
      edges={['bottom']}
      onRefresh={() => {
        void providerQuery.refetch();
        void servicesQuery.refetch();
        void portfolioQuery.refetch();
      }}
      refreshing={
        providerQuery.isRefetching || servicesQuery.isRefetching || portfolioQuery.isRefetching
      }
    >
      <Stack.Screen
        options={{
          title: '',
          headerRight: () => (
            <FavouriteButton providerId={provider.uid} providerName={provider.fullName} />
          ),
        }}
      />

      <View style={styles.header}>
        <Avatar name={provider.fullName} imageUrl={provider.profileImageUrl} size={104} />
        <AppText variant="title" align="center">
          {provider.fullName}
        </AppText>
        <RatingBadge rating={provider.rating} />
        {provider.skillCategory !== '' && (
          <View style={styles.skillChip}>
            <AppText variant="label" color="primary">
              {getCategoryLabel(provider.skillCategory)}
            </AppText>
          </View>
        )}
      </View>

      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color={colors.primary} />
          <AppText style={styles.infoText}>
            {provider.locationName || t('provider.locationNotSet')}
          </AppText>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={18} color={colors.primary} />
          <AppText style={styles.infoText}>{formatPhone(provider.phoneNumber)}</AppText>
        </View>
      </Card>

      {provider.bio !== '' && (
        <View style={styles.section}>
          <AppText variant="subtitle">{t('provider.about')}</AppText>
          <AppText color="textSecondary">{provider.bio}</AppText>
        </View>
      )}

      <ContactButtons
        phone={provider.phoneNumber}
        whatsAppMessage={t('provider.whatsAppMessage')}
      />

      <View style={styles.section}>
        <SectionHeader title={t('screens.pastWork')} />
        {portfolioQuery.isLoading ? (
          <LoadingState message={t('provider.loadingWork')} />
        ) : portfolioQuery.isError ? (
          <ErrorState
            message={getErrorMessage(portfolioQuery.error)}
            onRetry={() => portfolioQuery.refetch()}
            retrying={portfolioQuery.isFetching}
          />
        ) : (portfolioQuery.data ?? []).length === 0 ? (
          <AppText color="textSecondary">{t('provider.noWork')}</AppText>
        ) : (
          <PortfolioGallery items={portfolioQuery.data ?? []} />
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader title={t('provider.servicesOffered')} />
        {servicesQuery.isLoading ? (
          <LoadingState message={t('services.loading')} />
        ) : servicesQuery.isError ? (
          <ErrorState
            message={getErrorMessage(servicesQuery.error)}
            onRetry={() => servicesQuery.refetch()}
            retrying={servicesQuery.isFetching}
          />
        ) : listings.length === 0 ? (
          <AppText color="textSecondary">{t('provider.noListings')}</AppText>
        ) : (
          listings.map((listing) => (
            <Card
              key={listing.serviceId}
              onPress={() =>
                router.push({ pathname: '/service/[id]', params: { id: listing.serviceId } })
              }
              accessibilityLabel={t('common.viewItem', { name: listing.title })}
              style={styles.listingCard}
            >
              <View style={styles.listingText}>
                <AppText variant="bodyStrong" numberOfLines={1}>
                  {listing.title}
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  {getCategoryLabel(listing.category)} · {formatPrice(listing.startingPrice)}
                </AppText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Card>
          ))
        )}
      </View>

      <ReviewsSection providerId={provider.uid} providerName={provider.fullName} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: spacing.sm },
  skillChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
  },
  infoCard: { gap: spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  infoText: { flex: 1 },
  section: { gap: spacing.sm },
  listingCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  listingText: { flex: 1, gap: spacing.xxs },
});
