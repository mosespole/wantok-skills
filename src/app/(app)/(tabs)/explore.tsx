import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/common';
import { CategoryChips } from '@/components/common/CategoryChips';
import { SearchBar } from '@/components/common/SearchBar';
import { ServiceList } from '@/components/common/ServiceList';
import { getCategoryLabel } from '@/constants/categories';
import { useActiveServices } from '@/hooks/useServices';
import { colors, spacing } from '@/theme';
import { filterServices } from '@/utils/search';

/** Browse Services: every active listing, filterable by category. */
export default function ExploreScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const servicesQuery = useActiveServices();
  const [category, setCategory] = useState<string | undefined>(params.category);

  // Opening Explore from a Home category shortcut pre-selects that category.
  const [lastParam, setLastParam] = useState(params.category);
  if (params.category !== lastParam) {
    setLastParam(params.category);
    setCategory(params.category);
  }

  const services = filterServices(servicesQuery.data ?? [], { category });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <AppText variant="title">Explore services</AppText>
        <SearchBar onPress={() => router.push({ pathname: '/search', params: { category } })} />
      </View>
      <View style={styles.chips}>
        <CategoryChips value={category} onChange={setCategory} />
      </View>
      <ServiceList
        query={servicesQuery}
        services={services}
        emptyTitle={category ? `No ${getCategoryLabel(category)} services yet` : 'No services yet'}
        emptyMessage="Check back soon, or try another category."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  chips: { paddingVertical: spacing.md },
});
