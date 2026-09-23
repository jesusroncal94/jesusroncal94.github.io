import { getEntry } from 'astro:content';
import type { Locale } from '../i18n/locales';

export async function getSite(locale: Locale) {
  const entry = await getEntry('site', locale);
  if (!entry) throw new Error(`Missing site content for locale "${locale}"`);
  return entry.data;
}
