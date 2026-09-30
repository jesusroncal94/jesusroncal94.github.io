import { describe, expect, it } from 'vitest';
import type { Locale } from '../src/i18n/locales';
import { suggestLocale } from '../src/lib/suggest-locale';

const spanishPublished: Locale[] = ['en', 'es'];

describe('suggestLocale', () => {
  it.each([
    [['es-ES'], 'es'],
    [['es-MX', 'en'], 'es'],
    [['en-US', 'es'], null],
    [['it-IT', 'en'], null],
    [['it-IT', 'es'], 'es'],
    [['en-GB'], null],
  ])('suggests %j → %s while Spanish is the only other locale', (languages, expected) => {
    expect(suggestLocale(languages, spanishPublished, false)).toBe(expected);
  });

  it('suggests Italian once it is published', () => {
    expect(suggestLocale(['it-IT', 'en'], ['en', 'es', 'it'], false)).toBe('it');
  });

  it('stays quiet once dismissed', () => {
    expect(suggestLocale(['es-ES'], spanishPublished, true)).toBeNull();
  });
});
