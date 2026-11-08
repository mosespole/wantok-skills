import { en, type TranslationKey } from './en';
import { tpi } from './tpi';

/**
 * App languages. English is the default; Tok Pisin ('tpi', its ISO 639 code) can be
 * chosen on the Welcome screen or in Profile. The choice is saved on the phone.
 */
export type Language = 'en' | 'tpi';

export const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'tpi', label: 'Tok Pisin' },
];

const dictionaries: Record<Language, Record<TranslationKey, string>> = { en, tpi };

// The active language. Kept in a module variable so plain functions (error messages,
// price and date formatting) can translate too. When it changes, LanguageProvider
// remounts the screens, so every screen renders again in the new language.
let currentLanguage: Language = 'en';

export function getLanguage(): Language {
  return currentLanguage;
}

export function setCurrentLanguage(language: Language) {
  currentLanguage = language;
}

type Params = Record<string, string | number>;

function fill(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

/** Text for `key` in the active language, with `{name}` placeholders filled from `params`. */
export function t(key: TranslationKey, params?: Params): string {
  return fill(dictionaries[currentLanguage][key] ?? en[key], params);
}

/** Like `t`, choosing `${base}.one` when count is 1 and `${base}.other` otherwise. */
export function tCount(base: string, count: number, params?: Params): string {
  const key = `${base}.${count === 1 ? 'one' : 'other'}` as TranslationKey;
  return t(key, { count, ...params });
}

export function isTranslationKey(value: string): value is TranslationKey {
  return Object.prototype.hasOwnProperty.call(en, value);
}

/**
 * Translates a message that may be a dictionary key (validation and app errors are
 * stored as keys) and returns any other text unchanged.
 */
export function tMessage(message: string): string {
  return isTranslationKey(message) ? t(message) : message;
}

export type { TranslationKey };
