import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText, Avatar } from '@/components/common';
import { ProgressBar } from '@/components/common/ProgressBar';
import { STORAGE_ENABLED } from '@/constants/features';
import { useProfilePhoto } from '@/hooks/useProfilePhoto';
import { pickImage, type PickedImage } from '@/services/media/imagePickerService';
import { colors, spacing } from '@/theme';

const SIZE = 112;

interface ProfilePhotoEditorProps {
  name: string;
  currentUrl: string | null;
}

/** Choose → preview → upload flow for the profile photo, with progress, success and retry. */
export function ProfilePhotoEditor({ name, currentUrl }: ProfilePhotoEditorProps) {
  const photo = useProfilePhoto();
  const [picked, setPicked] = useState<PickedImage | null>(null);
  const [pickError, setPickError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const uploading = photo.status === 'uploading';

  if (!STORAGE_ENABLED) {
    return (
      <View style={styles.wrapper}>
        <Avatar name={name} imageUrl={currentUrl} size={SIZE} />
      </View>
    );
  }

  const choosePhoto = async () => {
    setPickError(null);
    setSaved(false);
    photo.reset();
    try {
      const image = await pickImage({ aspect: [1, 1] });
      if (image) setPicked(image);
    } catch {
      setPickError('Your photo library could not be opened. Please try again.');
    }
  };

  const uploadPhoto = async () => {
    if (!picked) return;
    try {
      await photo.replacePhoto(picked);
      setPicked(null);
      setSaved(true);
    } catch {
      // The hook already holds a readable error message; the picked photo is kept for a retry.
    }
  };

  return (
    <View style={styles.wrapper}>
      {picked ? (
        <Image
          source={{ uri: picked.uri }}
          style={styles.preview}
          contentFit="cover"
          accessibilityLabel="Selected photo preview"
        />
      ) : (
        <Avatar name={name} imageUrl={currentUrl} size={SIZE} />
      )}

      {uploading && (
        <View style={styles.progress}>
          <ProgressBar value={photo.progress} />
          <AppText variant="caption" color="textSecondary" align="center">
            Uploading... {Math.round(photo.progress * 100)}%
          </AppText>
        </View>
      )}

      {saved && (
        <View style={styles.message}>
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          <AppText variant="caption" color="success">
            Profile photo updated
          </AppText>
        </View>
      )}

      {(photo.error || pickError) && (
        <AppText variant="caption" color="error" align="center">
          {photo.error ?? pickError}
        </AppText>
      )}

      {picked ? (
        <View style={styles.actions}>
          <AppButton
            title="Cancel"
            variant="ghost"
            onPress={() => {
              setPicked(null);
              photo.reset();
            }}
            disabled={uploading}
            fullWidth={false}
          />
          <AppButton
            title={photo.status === 'error' ? 'Retry upload' : 'Upload photo'}
            icon="cloud-upload-outline"
            onPress={uploadPhoto}
            loading={uploading}
            fullWidth={false}
          />
        </View>
      ) : (
        <AppButton
          title={currentUrl ? 'Change photo' : 'Add a profile photo'}
          icon="image-outline"
          variant="secondary"
          onPress={choosePhoto}
          fullWidth={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: spacing.md },
  preview: { width: SIZE, height: SIZE, borderRadius: SIZE / 2 },
  progress: { alignSelf: 'stretch', gap: spacing.xs },
  message: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.sm },
});
