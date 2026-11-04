import { useCallback, useState } from 'react';

import { uploadImage, type ImageFolder } from '@/services/firebase/storageService';
import type { PickedImage } from '@/services/media/imagePickerService';
import { getErrorMessage } from '@/utils/errors';

import { useAuth } from './useAuth';

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

/** Uploads a picked image to the signed-in user's Storage folder and tracks progress. */
export function useImageUpload(folder: ImageFolder) {
  const { user } = useAuth();
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /** Returns the download URL, or throws after recording a readable error message. */
  const upload = useCallback(
    async (image: PickedImage): Promise<string> => {
      if (!user) throw new Error('You must be logged in to upload photos.');
      setStatus('uploading');
      setProgress(0);
      setError(null);
      try {
        const url = await uploadImage({
          uid: user.uid,
          folder,
          localUri: image.uri,
          mimeType: image.mimeType,
          onProgress: setProgress,
        });
        setStatus('success');
        return url;
      } catch (uploadError) {
        const message = getErrorMessage(uploadError);
        setStatus('error');
        setError(message);
        throw new Error(message);
      }
    },
    [user, folder],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setError(null);
  }, []);

  return { upload, reset, status, progress, error };
}
