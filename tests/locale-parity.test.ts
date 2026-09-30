import { existsSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import profile from '../data/public-profile.json';
import { DEFAULT_LOCALE, PUBLISHED_LOCALES } from '../src/i18n/locales';
import { localiseProfile } from '../src/i18n/profile';

const caseFiles = (locale: string) => readdirSync(`src/content/cases/${locale}`).sort();

const shownProfileValues = [
  profile.city,
  ...profile.roles.flatMap(({ location }) => (location ? [location] : [])),
  ...profile.education.flatMap(({ degree, institution }) => [degree, institution]),
  ...profile.skills.map(({ group }) => group),
  ...profile.languages.flatMap(({ name, level }) => [name, level]),
];

describe.each(PUBLISHED_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE))('published locale %s', (locale) => {
  it('has the site content and every case the default locale has', () => {
    expect(existsSync(`src/content/site/${locale}.yaml`)).toBe(true);
    expect(caseFiles(locale)).toEqual(caseFiles(DEFAULT_LOCALE));
  });

  it('translates every profile value its pages show', () => {
    for (const value of shownProfileValues) expect(() => localiseProfile(value, locale)).not.toThrow();
  });
});

it('publishes the default locale', () => {
  expect(PUBLISHED_LOCALES).toContain(DEFAULT_LOCALE);
});
