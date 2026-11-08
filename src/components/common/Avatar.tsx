import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

import { AppText } from './AppText';

import { t } from '@/i18n';
interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: number;
}

function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  return initials || '?';
}

/** Circular profile photo with an initials fallback when no photo has been uploaded. */
export function Avatar({ name, imageUrl, size = 56 }: AvatarProps) {
  const dimensions = { width: size, height: size, borderRadius: size / 2 };

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, dimensions]}
        contentFit="cover"
        transition={150}
        accessibilityLabel={t('a11y.profilePhoto', { name })}
      />
    );
  }

  return (
    <View style={[styles.fallback, dimensions]} accessibilityLabel={t('a11y.initials', { name })}>
      <AppText style={{ fontSize: size * 0.38, lineHeight: size * 0.5 }} color="primary">
        {getInitials(name)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: colors.surfaceMuted },
  fallback: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
