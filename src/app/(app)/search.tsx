import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useDeferredValue, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/common';
import { CategoryChips } from '@/components/common/CategoryChips';
import { SearchBar } from '@/components/common/SearchBar';
import { ServiceList } from '@/components/common/ServiceList';
import { useActiveServices } from '@/hooks/useServices';
import { colors, radius, spacing, typography } from '@/theme';
import { filterServices } from '@/utils/search';

/** Search & Filter: free text plus category and location filters over Firestore listings. */
export default function SearchScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const servicesQuery = useActiveServices();

  const [text, setText] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<string | undefined>(params.category);

  // Keeps typing smooth: filtering uses a slightly delayed copy of the input.
  const deferredText = useDeferredValue(text);
  const deferredLocation = useDeferredValue(location);

  const results = filterServices(servicesQuery.data ?? [], {
    text: deferredText,
    location: deferredLocation,
    category,
  });
  const hasFilters = Boolean(text || location || category);

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
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
          servicesQuery.isSuccess ? (
            <AppText variant="caption" color="textSecondary" style={styles.count}>
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </AppText>
          ) : undefined
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
  count: { marginBottom: spacing.sm },
});
