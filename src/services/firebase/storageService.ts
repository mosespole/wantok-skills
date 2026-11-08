import { FirebaseError } from 'firebase/app';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';

import { STORAGE_ENABLED } from '@/constants/features';

import { app } from './firebaseConfig';

/**
 * Storage is created only when first needed, so projects without a Storage bucket
 * (e.g. the free Spark plan) never touch it.
 */
function getImageStorage() {
  if (!STORAGE_ENABLED) {
    throw new Error('errors.uploadsUnavailable');
  }
  return getStorage(app);
}

/** Top-level Storage folders. storage.rules only allow a user to write inside their own UID folder. */
export type ImageFolder = 'profileImages' | 'serviceImages';

/** Must match storage.rules (5 MB, JPEG/PNG/WebP). Checked here first for a friendlier message. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/** Picks a content type from the picker's mime type, or from the file extension as a fallback. */
function resolveContentType(localUri: string, mimeType?: string | null): string {
  if (mimeType) return mimeType === 'image/jpg' ? 'image/jpeg' : mimeType;
  const extension = localUri.split('.').pop()?.toLowerCase();
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  return 'image/jpeg';
}

export interface UploadImageOptions {
  uid: string;
  folder: ImageFolder;
  /** Local file URI from the image picker (only valid on this device). */
  localUri: string;
  mimeType?: string | null;
  /** Called with a value from 0 to 1 as bytes are sent. */
  onProgress?: (fraction: number) => void;
}

/**
 * Uploads a picked image to Firebase Storage and returns its public download URL.
 * Only this download URL is saved in Firestore, never the device-specific local URI.
 */
export async function uploadImage({
  uid,
  folder,
  localUri,
  mimeType,
  onProgress,
}: UploadImageOptions): Promise<string> {
  const contentType = resolveContentType(localUri, mimeType);
  if (!ALLOWED_TYPES.includes(contentType)) {
    throw new Error('errors.photoType');
  }

  // React Native can turn a local file into a Blob via fetch, which Firebase can upload.
  const response = await fetch(localUri);
  const blob = await response.blob();
  if (blob.size > MAX_IMAGE_BYTES) {
    throw new Error('errors.photoTooLarge');
  }

  // A unique name per upload, so a replaced photo is never served from an old cache.
  const fileName = `${Date.now()}.${EXTENSIONS[contentType]}`;
  const storageRef = ref(getImageStorage(), `${folder}/${uid}/${fileName}`);

  const task = uploadBytesResumable(storageRef, blob, { contentType });
  await new Promise<void>((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot) => onProgress?.(snapshot.bytesTransferred / Math.max(snapshot.totalBytes, 1)),
      reject,
      () => resolve(),
    );
  });

  return getDownloadURL(task.snapshot.ref);
}

/**
 * Deletes a previously uploaded image. Used when a photo is replaced or its
 * listing is deleted. Missing files are ignored; other failures are reported.
 */
export async function deleteImageByUrl(downloadUrl: string): Promise<void> {
  try {
    await deleteObject(ref(getImageStorage(), downloadUrl));
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'storage/object-not-found') return;
    throw error;
  }
}
