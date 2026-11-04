import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText, Avatar } from '@/components/common';
import { useProfilePhoto } from '@/hooks/useProfilePhoto';
import { pickImage, type PickedImage } from '@/services/media/imagePickerService';
import { colors, spacing } from '@/theme';

const SIZE = 112;

interface ProfilePhotoEditorProps {
  name: string;
  currentUrl: string | null;
}

/** Choose → preview → save flow for the profile picture, with success, error and retry. */
export function ProfilePhotoEditor({ name, currentUrl }: ProfilePhotoEditorProps) {
  const photo = useProfilePhoto();
  const [picked, setPicked] = useState<PickedImage | null>(null);
  const [pickError, setPickError] = useState<string | null>(null);

  const saving = photo.status === 'saving';

  const choosePhoto = async () => {
    setPickError(null);
    photo.reset();
    try {
      const image = await pickImage({ aspect: [1, 1] });
      if (image) setPicked(image);
    } catch {
      setPickError('Your photo library could not be opened. Please try again.');
    }
  };

  const savePhoto = async () => {
    if (!picked) return;
    try {
      await photo.savePhoto(picked);
      setPicked(null);
    } catch {
      // The hook holds a readable error; the picked photo is kept so the user can retry.
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

      {photo.status === 'success' && (
        <View style={styles.message}>
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          <AppText variant="caption" color="success">
            Profile picture updated
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
            disabled={saving}
            fullWidth={false}
          />
          <AppButton
            title={photo.status === 'error' ? 'Try again' : 'Save picture'}
            icon="checkmark"
            onPress={savePhoto}
            loading={saving}
            fullWidth={false}
          />
        </View>
      ) : (
        <View style={styles.actions}>
          <AppButton
            title={currentUrl ? 'Change picture' : 'Add a profile picture'}
            icon="image-outline"
            variant="secondary"
            onPress={choosePhoto}
            disabled={saving}
            fullWidth={false}
          />
          {currentUrl && (
            <AppButton
              title="Remove"
              variant="ghost"
              onPress={photo.removePhoto}
              loading={saving}
              fullWidth={false}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: spacing.md },
  preview: { width: SIZE, height: SIZE, borderRadius: SIZE / 2 },
  message: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm },
});
