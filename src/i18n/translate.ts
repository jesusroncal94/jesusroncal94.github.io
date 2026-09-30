import type { Locale } from './locales';
import { en, type UiKey } from './ui/en';
import { es } from './ui/es';

export type UiDictionary = Record<UiKey, string>;

const dictionaries: Partial<Record<Locale, UiDictionary>> = { en, es };

export function useTranslations(locale: Locale): (key: UiKey) => string {
  const dictionary = dictionaries[locale] ?? en;
  return (key) => dictionary[key];
}

export const interpolate = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (placeholder, name: string) => values[name] ?? placeholder);
