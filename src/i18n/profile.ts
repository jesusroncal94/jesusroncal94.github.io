import { DEFAULT_LOCALE, type Locale } from './locales';
import { es } from './profile/es';

const translations: Partial<Record<Locale, Record<string, string>>> = { es };

export class MissingProfileTranslation extends Error {
  constructor(value: string, locale: Locale) {
    super(`No ${locale} translation for the profile value "${value}". Add it to src/i18n/profile/${locale}.ts`);
  }
}

export function localiseProfile(value: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return value;
  const translated = translations[locale]?.[value];
  if (translated === undefined) throw new MissingProfileTranslation(value, locale);
  return translated;
}
