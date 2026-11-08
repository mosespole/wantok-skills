import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { useAuth } from '@/hooks/useAuth';
import { useFavourites } from '@/hooks/useFavourites';
import { colors } from '@/theme';

import { t } from '@/i18n';
interface FavouriteButtonProps {
  providerId: string;
  providerName: string;
  size?: number;
}

/** Heart toggle that saves a provider to the signed-in user's favourites in Firestore. */
export function FavouriteButton({ providerId, providerName, size = 24 }: FavouriteButtonProps) {
  const { user } = useAuth();
  const { isFavourite, toggleFavourite } = useFavourites();

  // Providers cannot favourite themselves (also enforced by the security rules).
  if (!user || user.uid === providerId) return null;

  const saved = isFavourite(providerId);

  return (
    <Pressable
      // Errors roll the heart back automatically (optimistic update in useFavourites).
      onPress={() => toggleFavourite(providerId).catch(() => undefined)}
      hitSlop={10}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityState={{ selected: saved }}
      accessibilityLabel={
        saved
          ? t('favourites.remove', { name: providerName })
          : t('favourites.save', { name: providerName })
      }
    >
      <Ionicons
        name={saved ? 'heart' : 'heart-outline'}
        size={size}
        color={saved ? colors.accentRed : colors.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { padding: 4 },
  pressed: { opacity: 0.6 },
});
