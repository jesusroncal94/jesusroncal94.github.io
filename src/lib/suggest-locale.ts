import { DEFAULT_LOCALE, isLocale, type Locale } from '../i18n/locales';

export function suggestLocale(languages: readonly string[], published: readonly Locale[], dismissed: boolean): Locale | null {
  if (dismissed) return null;
  for (const language of languages) {
    const base = language.toLowerCase().split('-')[0];
    if (base === DEFAULT_LOCALE) return null;
    if (isLocale(base) && published.includes(base)) return base;
  }
  return null;
}
