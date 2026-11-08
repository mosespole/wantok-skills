import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common';
import { ProgressBar } from '@/components/common/ProgressBar';
import { STORAGE_ENABLED } from '@/constants/features';
import { pickImage, type PickedImage } from '@/services/media/imagePickerService';
import { colors, radius, spacing } from '@/theme';

import { t } from '@/i18n';
/** What the provider did with the listing photo; applied when the form is saved. */
export type ImageChange =
  { type: 'keep' } | { type: 'remove' } | { type: 'replace'; image: PickedImage };

interface ServiceImageFieldProps {
  /** Photo already saved on the listing, if any. */
  currentUrl: string | null;
  change: ImageChange;
  onChange: (change: ImageChange) => void;
  /** 0–1 while the photo uploads during save, otherwise null. */
  uploadProgress: number | null;
}

export function ServiceImageField({
  currentUrl,
  change,
  onChange,
  uploadProgress,
}: ServiceImageFieldProps) {
  const [pickError, setPickError] = useState<string | null>(null);

  const previewUri =
    change.type === 'replace' ? change.image.uri : change.type === 'keep' ? currentUrl : null;
  const uploading = uploadProgress !== null;

  if (!STORAGE_ENABLED) return null;

  const choose = async () => {
    setPickError(null);
    try {
      const image = await pickImage({ aspect: [16, 10] });
      if (image) onChange({ type: 'replace', image });
    } catch {
      setPickError(t('photo.libraryError'));
    }
  };

  return (
    <View style={styles.wrapper}>
      <AppText variant="label" color="textSecondary">
        {t('serviceImage.label')}{' '}
        <AppText variant="caption" color="textMuted">
          {t('common.optional')}
        </AppText>
      </AppText>

      {previewUri ? (
        <View>
          <Image
            source={{ uri: previewUri }}
            style={styles.preview}
            contentFit="cover"
            accessibilityLabel={t('serviceImage.preview')}
          />
          {!uploading && (
            <Pressable
              style={styles.removeButton}
              // Removing a newly picked photo goes back to the saved one; removing the
              // saved photo marks it for deletion.
              onPress={() =>
                onChange(
                  change.type === 'replace' || !currentUrl ? { type: 'keep' } : { type: 'remove' },
                )
              }
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('serviceImage.remove')}
            >
              <Ionicons name="close" size={18} color={colors.textOnPrimary} />
            </Pressable>
          )}
        </View>
      ) : (
        <Pressable
          style={styles.empty}
          onPress={choose}
          accessibilityRole="button"
          accessibilityLabel={t('serviceImage.add')}
        >
          <Ionicons name="image-outline" size={32} color={colors.primary} />
          <AppText variant="label" color="primary">
            {t('serviceImage.addHint')}
          </AppText>
        </Pressable>
      )}

      {previewUri && !uploading && (
        <Pressable onPress={choose} accessibilityRole="button">
          <AppText variant="label" color="primary">
            {t('common.chooseDifferentPhoto')}
          </AppText>
        </Pressable>
      )}

      {uploading && (
        <View style={styles.progress}>
          <ProgressBar value={uploadProgress} />
          <AppText variant="caption" color="textSecondary">
            {t('serviceImage.uploading', { percent: Math.round(uploadProgress * 100) })}
          </AppText>
        </View>
      )}

      {pickError && (
        <AppText variant="caption" color="error">
          {pickError}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  preview: { width: '100%', aspectRatio: 16 / 10, borderRadius: radius.md },
  removeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    aspectRatio: 16 / 7,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  progress: { gap: spacing.xs },
});
