import { formatDistanceToNow } from 'date-fns';

const PNG_COUNTRY_CODE = '675';

/**
 * Normalises a PNG phone number to local digits only.
 * Accepts formats such as "7123 4567", "+675 7123 4567" and "67571234567".
 */
export function toLocalPhoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith(PNG_COUNTRY_CODE) && digits.length > 8) {
    return digits.slice(PNG_COUNTRY_CODE.length);
  }
  return digits;
}

/** International format without "+", as required by wa.me links (e.g. 67571234567). */
export function toInternationalPhone(phone: string): string {
  return `${PNG_COUNTRY_CODE}${toLocalPhoneDigits(phone)}`;
}

/** Display format: 8-digit mobiles as "7123 4567", 7-digit landlines as "325 1234". */
export function formatPhone(phone: string): string {
  const local = toLocalPhoneDigits(phone);
  if (local.length === 8) return `${local.slice(0, 4)} ${local.slice(4)}`;
  if (local.length === 7) return `${local.slice(0, 3)} ${local.slice(3)}`;
  return phone;
}

export function formatPrice(price: number | null): string {
  if (price === null) return 'Price on request';
  return `From K${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

export function formatRelativeDate(date: Date | null): string {
  if (!date) return '';
  return formatDistanceToNow(date, { addSuffix: true });
}
