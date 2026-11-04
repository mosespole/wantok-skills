import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useDeferredValue, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/common';
import { CategoryChips } from '@/components/common/CategoryChips';
import { DataStatusNotice } from '@/components/common/DataStatusNotice';
import { SearchBar } from '@/components/common/SearchBar';
import { ServiceList } from '@/components/common/ServiceList';
import { ProviderCard } from '@/components/cards/ProviderCard';
import { useAllProviders } from '@/hooks/useProvider';
import { useActiveServices } from '@/hooks/useServices';
import { colors, radius, spacing, typography } from '@/theme';
import { filterProviders, filterServices } from '@/utils/search';

const MAX_PROVIDER_RESULTS = 10;

/**
 * Search & Filter: free text plus category and location filters. Shows matching providers
 * (by name, skill or location, even without listings) and matching service listings.
 */
export default function SearchScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const servicesQuery = useActiveServices();

  const [text, setText] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<string | undefined>(params.category);

  // Keeps typing smooth: filtering uses a slightly delayed copy of the input.
  const deferredText = useDeferredValue(text);
  const deferredLocation = useDeferredValue(location);

  const results = filterServices(servicesQuery.data?.services ?? [], {
    text: deferredText,
    location: deferredLocation,
    category,
  });
  const hasFilters = Boolean(text || location || category);

  // Providers are only searched once the user has typed or picked a filter.
  const providersQuery = useAllProviders(hasFilters);
  const matchingProviders = hasFilters
    ? filterProviders(providersQuery.data ?? [], {
        text: deferredText,
        location: deferredLocation,
        category,
      }).slice(0, MAX_PROVIDER_RESULTS)
    : [];

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <DataStatusNotice
          source={servicesQuery.data?.source}
          updatedAt={servicesQuery.data?.updatedAt}
          onRetry={() => servicesQuery.refetch()}
        />
        <SearchBar
          value={text}
          onChangeText={setText}
          placeholder="Plumber, tutoring, a name..."
          autoFocus
        />
        <View style={styles.locationField}>
          <Ionicons name="location-outline" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.locationInput}
            value={location}
            onChangeText={setLocation}
            placeholder="Any location (e.g. Lae, Goroka)"
            placeholderTextColor={colors.textMuted}
            autoCorrect={false}
            accessibilityLabel="Filter by location"
          />
        </View>
      </View>
      <View style={styles.chips}>
        <CategoryChips value={category} onChange={setCategory} />
      </View>

      <ServiceList
        query={servicesQuery}
        services={results}
        header={
          <View style={styles.header}>
            {matchingProviders.length > 0 && (
              <View style={styles.providers}>
                <AppText variant="subtitle">Providers</AppText>
                {matchingProviders.map((provider) => (
                  <ProviderCard key={provider.uid} provider={provider} />
                ))}
              </View>
            )}
            {servicesQuery.isSuccess && (
              <AppText variant="caption" color="textSecondary">
                {results.length} {results.length === 1 ? 'service' : 'services'}
              </AppText>
            )}
          </View>
        }
        emptyTitle={hasFilters ? 'No matching services' : 'No services yet'}
        emptyMessage={
          hasFilters
            ? 'Try different words, another location, or clear the category filter.'
            : 'Check back soon.'
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filters: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  locationField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationInput: { flex: 1, ...typography.body, color: colors.textPrimary },
  chips: { paddingVertical: spacing.md },
  header: { gap: spacing.md, marginBottom: spacing.sm },
  providers: { gap: spacing.sm },
});
