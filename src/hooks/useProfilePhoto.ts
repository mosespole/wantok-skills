import { useCallback } from 'react';

import { deleteImageByUrl } from '@/services/firebase/storageService';
import type { PickedImage } from '@/services/media/imagePickerService';
import { getErrorMessage } from '@/utils/errors';

import { useAuth } from './useAuth';
import { useImageUpload } from './useImageUpload';
import { useUpdateProfile } from './useUpdateProfile';

/**
 * Replaces the signed-in user's profile photo:
 * 1. upload the new image to Storage, 2. save its URL on the Firestore profile,
 * 3. remove the previous image so old photos do not pile up in Storage.
 */
export function useProfilePhoto() {
  const { profile } = useAuth();
  const imageUpload = useImageUpload('profileImages');
  const updateProfile = useUpdateProfile();
  const { upload } = imageUpload;
  const { mutateAsync: saveProfile } = updateProfile;

  const replacePhoto = useCallback(
    async (image: PickedImage) => {
      const previousUrl = profile?.profileImageUrl ?? null;
      const newUrl = await upload(image);
      await saveProfile({ profileImageUrl: newUrl });
      if (previousUrl) {
        // Clean-up only; the new photo is already saved, so a failure here is not shown.
        await deleteImageByUrl(previousUrl).catch(() => undefined);
      }
    },
    [profile?.profileImageUrl, upload, saveProfile],
  );

  return {
    replacePhoto,
    status: updateProfile.isPending ? 'uploading' : imageUpload.status,
    progress: imageUpload.progress,
    error: imageUpload.error ?? (updateProfile.error ? getErrorMessage(updateProfile.error) : null),
    reset: () => {
      imageUpload.reset();
      updateProfile.reset();
    },
  };
}
