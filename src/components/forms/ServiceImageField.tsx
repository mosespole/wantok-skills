import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common';
import { ProgressBar } from '@/components/common/ProgressBar';
import { pickImage, type PickedImage } from '@/services/media/imagePickerService';
import { colors, radius, spacing } from '@/theme';

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

  const choose = async () => {
    setPickError(null);
    try {
      const image = await pickImage({ aspect: [16, 10] });
      if (image) onChange({ type: 'replace', image });
    } catch {
      setPickError('Your photo library could not be opened. Please try again.');
    }
  };

  return (
    <View style={styles.wrapper}>
      <AppText variant="label" color="textSecondary">
        Service photo{' '}
        <AppText variant="caption" color="textMuted">
          (optional)
        </AppText>
      </AppText>

      {previewUri ? (
        <View>
          <Image
            source={{ uri: previewUri }}
            style={styles.preview}
            contentFit="cover"
            accessibilityLabel="Service photo preview"
          />
          {!uploading && (
            <Pressable
              style={styles.removeButton}
              onPress={() => onChange(currentUrl ? { type: 'remove' } : { type: 'keep' })}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Remove photo"
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
          accessibilityLabel="Add a service photo"
        >
          <Ionicons name="image-outline" size={32} color={colors.primary} />
          <AppText variant="label" color="primary">
            Add a photo of your work
          </AppText>
        </Pressable>
      )}

      {previewUri && !uploading && (
        <Pressable onPress={choose} accessibilityRole="button">
          <AppText variant="label" color="primary">
            Choose a different photo
          </AppText>
        </Pressable>
      )}

      {uploading && (
        <View style={styles.progress}>
          <ProgressBar value={uploadProgress} />
          <AppText variant="caption" color="textSecondary">
            Uploading photo... {Math.round(uploadProgress * 100)}%
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
