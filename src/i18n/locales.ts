export const LOCALES = ['en', 'es', 'it'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const PUBLISHED_LOCALES: readonly Locale[] = ['en'];

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function localePath(locale: Locale, path = ''): string {
  const segments = path.split('/').filter(Boolean);
  if (locale !== DEFAULT_LOCALE) segments.unshift(locale);
  const joined = segments.join('/');
  return joined ? `/${joined}/` : '/';
}

export function stripLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] && isLocale(segments[0])) segments.shift();
  return segments.join('/');
}

const OG_LOCALES: Record<Locale, string> = { en: 'en_US', es: 'es_ES', it: 'it_IT' };

export const ogLocale = (locale: Locale) => OG_LOCALES[locale];

export const localeRoutes = () =>
  PUBLISHED_LOCALES.map((locale) => ({
    params: { locale: locale === DEFAULT_LOCALE ? undefined : locale },
    props: { locale },
  }));

export const LOCALE_NAMES: Record<Locale, string> = { en: 'English', es: 'Español', it: 'Italiano' };

export const isMultilingual = () => PUBLISHED_LOCALES.length > 1;
