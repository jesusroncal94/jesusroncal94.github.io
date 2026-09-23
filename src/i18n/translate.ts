import type { Locale } from './locales';
import { en, type UiKey } from './ui/en';

export type UiDictionary = Record<UiKey, string>;

const dictionaries: Partial<Record<Locale, UiDictionary>> = { en };

export function useTranslations(locale: Locale): (key: UiKey) => string {
  const dictionary = dictionaries[locale] ?? en;
  return (key) => dictionary[key];
}
