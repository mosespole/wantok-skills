import { Linking } from 'react-native';

import { toInternationalPhone } from './formatting';

/** Opens the phone dialler with the number filled in. Throws if the device cannot make calls. */
export async function callPhone(phone: string): Promise<void> {
  try {
    await Linking.openURL(`tel:+${toInternationalPhone(phone)}`);
  } catch {
    throw new Error('This device cannot make phone calls.');
  }
}

/**
 * Opens a WhatsApp chat with the number. wa.me links open the WhatsApp app when it
 * is installed and fall back to the browser otherwise, so this works on any phone.
 */
export async function openWhatsApp(phone: string, message?: string): Promise<void> {
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  try {
    await Linking.openURL(`https://wa.me/${toInternationalPhone(phone)}${text}`);
  } catch {
    throw new Error('WhatsApp could not be opened on this device.');
  }
}
