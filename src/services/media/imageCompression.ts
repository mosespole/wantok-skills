import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

/**
 * Photos are stored inside Firestore documents (the free Spark plan has no Cloud
 * Storage), so each photo is resized and compressed into a small JPEG and saved as
 * a base64 "data URI" string. Firestore documents are limited to 1 MiB, so every
 * kind of photo has a maximum encoded size.
 */
export const PHOTO_PRESETS = {
  /** Profile pictures: small square avatars. */
  profile: { width: 320, quality: 0.7, maxChars: 150_000 },
  /** Past-work photos: large enough to show detail on a phone screen. */
  portfolio: { width: 1024, quality: 0.6, maxChars: 700_000 },
} as const;

export type PhotoPreset = keyof typeof PHOTO_PRESETS;

const DATA_URI_PREFIX = 'data:image/jpeg;base64,';

async function encode(uri: string, width: number, quality: number): Promise<string> {
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width, height: null });
  const image = await context.renderAsync();
  const result = await image.saveAsync({
    base64: true,
    compress: quality,
    format: SaveFormat.JPEG,
  });
  if (!result.base64) throw new Error('errors.photoProcess');
  return DATA_URI_PREFIX + result.base64;
}

/**
 * Resizes and compresses a picked photo into a JPEG data URI that fits the preset's
 * size limit. If the first attempt is too large, it retries smaller and lower quality.
 */
export async function compressPhoto(localUri: string, preset: PhotoPreset): Promise<string> {
  const { width, quality, maxChars } = PHOTO_PRESETS[preset];
  const attempts = [
    { width, quality },
    { width: Math.round(width * 0.75), quality: quality - 0.15 },
    { width: Math.round(width * 0.5), quality: quality - 0.25 },
  ];

  for (const attempt of attempts) {
    const dataUri = await encode(localUri, attempt.width, attempt.quality);
    if (dataUri.length <= maxChars) return dataUri;
  }
  throw new Error('errors.photoTooDetailed');
}
