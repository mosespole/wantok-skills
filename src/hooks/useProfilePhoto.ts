import { useState } from 'react';

import { compressPhoto } from '@/services/media/imageCompression';
import type { PickedImage } from '@/services/media/imagePickerService';
import { getErrorMessage } from '@/utils/errors';

import { useUpdateProfile } from './useUpdateProfile';

export type PhotoStatus = 'idle' | 'saving' | 'success' | 'error';

/**
 * Replaces the signed-in user's profile picture. The photo is shrunk to a small
 * JPEG and saved on the user's Firestore profile (works on the free Spark plan).
 */
export function useProfilePhoto() {
  const updateProfile = useUpdateProfile();
  const [status, setStatus] = useState<PhotoStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const savePhoto = async (image: PickedImage) => {
    setStatus('saving');
    setError(null);
    try {
      const dataUri = await compressPhoto(image.uri, 'profile');
      await updateProfile.mutateAsync({ profileImageUrl: dataUri });
      setStatus('success');
    } catch (saveError) {
      setStatus('error');
      setError(getErrorMessage(saveError));
      throw saveError;
    }
  };

  const removePhoto = async () => {
    setStatus('saving');
    setError(null);
    try {
      await updateProfile.mutateAsync({ profileImageUrl: null });
      setStatus('idle');
    } catch (removeError) {
      setStatus('error');
      setError(getErrorMessage(removeError));
    }
  };

  const reset = () => {
    setStatus('idle');
    setError(null);
  };

  return { savePhoto, removePhoto, reset, status, error };
}
