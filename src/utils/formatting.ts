import { t, tCount, type TranslationKey } from '@/i18n';

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
  if (price === null) return t('price.onRequest');
  return t('price.from', { price: price.toLocaleString('en-US', { maximumFractionDigits: 2 }) });
}

/** "3 days ago" / "3 de i go pinis", in the app's current language. */
export function formatRelativeDate(date: Date | null): string {
  if (!date) return '';
  const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60_000));
  if (minutes < 1) return t('time.justNow');
  if (minutes < 60) return tCount('time.minutes', minutes);
  const hours = Math.round(minutes / 60);
  if (hours < 24) return tCount('time.hours', hours);
  const days = Math.round(hours / 24);
  if (days < 30) return tCount('time.days', days);
  const months = Math.round(days / 30);
  if (months < 12) return tCount('time.months', months);
  return tCount('time.years', Math.round(days / 365));
}

/** "5 November 2026" / "5 Novemba 2026", in the app's current language. */
export function formatDate(date: Date): string {
  const month = t(`month.${date.getMonth() + 1}` as TranslationKey);
  return `${date.getDate()} ${month} ${date.getFullYear()}`;
}
