import * as ImagePicker from 'expo-image-picker';

/** A photo chosen on the device, before it has been uploaded. */
export interface PickedImage {
  uri: string;
  mimeType: string | null;
}

export interface PickImageOptions {
  /** Crop aspect ratio, e.g. [1, 1] for profile photos. */
  aspect: [number, number];
}

/**
 * Opens the system photo library. On current Android and iOS versions the
 * system picker needs no storage permission, so no permission prompt is shown.
 * Returns null if the user cancels.
 */
export async function pickImage({ aspect }: PickImageOptions): Promise<PickedImage | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect,
    // Compress so photos upload quickly on mobile data and stay well under 5 MB.
    quality: 0.7,
  });

  if (result.canceled || result.assets.length === 0) return null;
  const asset = result.assets[0];
  return { uri: asset.uri, mimeType: asset.mimeType ?? null };
}
