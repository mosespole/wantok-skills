import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common';
import { getCategoryLabel } from '@/constants/categories';
import { colors, radius, spacing } from '@/theme';
import type { PortfolioItem } from '@/types/portfolio';

/** Two-column grid of past-work photos. Each tile opens the full project. */
export function PortfolioGallery({ items }: { items: PortfolioItem[] }) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <Pressable
          key={item.itemId}
          style={styles.tile}
          onPress={() => router.push({ pathname: '/work/[id]', params: { id: item.itemId } })}
          accessibilityRole="button"
          accessibilityLabel={`${item.caption}, ${getCategoryLabel(item.category)}`}
        >
          <Image source={{ uri: item.imageData }} style={styles.photo} contentFit="cover" />
          <AppText variant="caption" numberOfLines={2} style={styles.caption}>
            {item.caption}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  // Two columns: each tile takes just under half the row to leave room for the gap.
  tile: { width: '47%', flexGrow: 1, gap: spacing.xs },
  photo: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  caption: { paddingHorizontal: spacing.xxs },
});
