import { readdirSync, readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { localePath, PUBLISHED_LOCALES } from '../src/i18n/locales';

const slugs = readdirSync('src/content/cases/en').map((file) => file.replace(/\.md$/, ''));

it('audits every published page with Lighthouse', () => {
  const pages = [
    ...PUBLISHED_LOCALES.flatMap((locale) => [
      localePath(locale),
      localePath(locale, 'cv'),
      localePath(locale, 'privacy'),
      ...slugs.map((slug) => localePath(locale, `work/${slug}`)),
    ]),
    '/404.html',
  ];
  const config = JSON.parse(readFileSync('lighthouserc.json', 'utf8'));
  const audited = config.ci.collect.url.map((url: string) => new URL(url).pathname.replace(/index\.html$/, ''));
  expect([...audited].sort()).toEqual([...pages].sort());
});
