import type { ImageChange } from '@/components/forms/ServiceImageField';
import { deleteImageByUrl } from '@/services/firebase/storageService';

import { useImageUpload } from './useImageUpload';

/**
 * Applies a listing photo change in two steps so a failed save never loses a photo:
 * - `resolveImageUrl` uploads a new photo (if any) BEFORE the listing is saved;
 * - `cleanUp` deletes the old photo only AFTER the listing saved successfully.
 */
export function useServiceImage() {
  const imageUpload = useImageUpload('serviceImages');

  const resolveImageUrl = async (
    change: ImageChange,
    currentUrl: string | null,
  ): Promise<{ imageUrl: string | null; replacedUrl: string | null }> => {
    if (change.type === 'keep') return { imageUrl: currentUrl, replacedUrl: null };
    if (change.type === 'remove') return { imageUrl: null, replacedUrl: currentUrl };
    const imageUrl = await imageUpload.upload(change.image);
    return { imageUrl, replacedUrl: currentUrl };
  };

  const cleanUp = async (replacedUrl: string | null) => {
    if (replacedUrl) await deleteImageByUrl(replacedUrl).catch(() => undefined);
  };

  return {
    resolveImageUrl,
    cleanUp,
    uploadProgress: imageUpload.status === 'uploading' ? imageUpload.progress : null,
  };
}
