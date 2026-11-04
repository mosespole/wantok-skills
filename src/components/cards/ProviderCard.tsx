import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, Avatar, Card } from '@/components/common';
import { FavouriteButton } from '@/components/common/FavouriteButton';
import { getCategoryLabel } from '@/constants/categories';
import { colors, spacing } from '@/theme';
import type { ProviderSummary } from '@/types/service';

/** Compact provider row with a favourite toggle. Opens the provider's profile. */
export function ProviderCard({ provider }: { provider: ProviderSummary }) {
  return (
    <Card
      onPress={() => router.push({ pathname: '/provider/[id]', params: { id: provider.uid } })}
      accessibilityLabel={`View ${provider.fullName}'s profile`}
      style={styles.card}
    >
      <Avatar name={provider.fullName} imageUrl={provider.profileImageUrl} size={52} />
      <View style={styles.body}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {provider.fullName}
        </AppText>
        {provider.skillCategory !== '' && (
          <AppText variant="caption" color="primary">
            {getCategoryLabel(provider.skillCategory)}
          </AppText>
        )}
        {provider.locationName !== '' && (
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
            <AppText variant="caption" color="textMuted" numberOfLines={1}>
              {provider.locationName}
            </AppText>
          </View>
        )}
      </View>
      <FavouriteButton providerId={provider.uid} providerName={provider.fullName} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  body: { flex: 1, gap: spacing.xxs },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
});
