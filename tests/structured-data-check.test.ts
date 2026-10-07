import { describe, expect, it } from 'vitest';
import { caseArticle, personEntity, profilePage, toJsonLd } from '../src/lib/structured-data';
import { findStructuredDataProblems } from '../src/lib/structured-data-check';

const site = 'https://site.invalid';
const home = `${site}/es/`;
const caseUrl = `${site}/es/work/01-evals/`;
const preview = `${site}/es/og/work/01-evals.jpg?v=0123abcd`;

const person = personEntity({
  site,
  name: 'Ada Example',
  jobTitle: 'AI & Backend Engineer',
  city: 'Milan',
  country: 'IT',
  url: home,
  image: `${site}/_astro/portrait.webp`,
  profiles: ['https://github.com/ada'],
});
const profile = profilePage({ name: 'Ada Example', url: home, inLanguage: 'es', person });
const article = caseArticle({ site, author: { name: 'Ada Example', url: home }, headline: 'A case', description: 'What happened.', image: preview, url: caseUrl, inLanguage: 'es' });

const script = (data: object | string) =>
  `<script type="application/ld+json">${typeof data === 'string' ? data : toJsonLd(data)}</script>`;
const page = (url: string, ...blocks: string[]) =>
  `<html><head><meta property="og:url" content="${url}" /><meta property="og:image" content="${preview}" />${blocks.join('')}</head></html>`;

describe('findStructuredDataProblems', () => {
  it('passes a home page, a case page and a page without data', () => {
    expect(
      findStructuredDataProblems([
        { path: 'es/index.html', html: page(home, script(profile)) },
        { path: 'es/work/01-evals/index.html', html: page(caseUrl, script(article)) },
        { path: 'es/cv/index.html', html: '<html><head></head></html>' },
        { path: 'cv/index.html', html: '<html><head></head></html>' },
        { path: 'es/og/home.jpg' },
      ]),
    ).toEqual([]);
  });

  it('reports a missing, a doubled, a broken and a misplaced block', () => {
    expect(
      findStructuredDataProblems([
        { path: 'index.html', html: page(`${site}/`) },
        { path: 'work/01-evals/index.html', html: page(`${site}/work/01-evals/`, script(article), script(article)) },
        { path: 'es/work/01-evals/index.html', html: page(caseUrl, script('{"@type":')) },
        { path: '404.html', html: page(`${site}/404.html`, script(profile)) },
      ]),
    ).toEqual([
      { page: '/', reason: '0 structured data blocks, expected 1' },
      { page: '/work/01-evals/', reason: '2 structured data blocks, expected 1' },
      { page: '/es/work/01-evals/', reason: 'the structured data block is not valid JSON' },
      { page: '/404.html', reason: '1 structured data block(s) where none belongs' },
    ]);
  });

  it('reports a wrong type, a foreign @id and an empty field on the home page', () => {
    const wrong = { ...profile, '@type': 'WebPage', mainEntity: { ...person, '@id': 'https://other.invalid/#person', jobTitle: '' } };
    expect(findStructuredDataProblems([{ path: 'es/index.html', html: page(home, script(wrong)) }])).toEqual([
      { page: '/es/', reason: '@type is WebPage, not ProfilePage' },
      { page: '/es/', reason: `person @id is https://other.invalid/#person, not ${site}/#person` },
      { page: '/es/', reason: 'person has no jobTitle' },
    ]);
  });

  it('reports an article with a bare author reference, a stale image or another page address', () => {
    const stale = { ...article, image: `${site}/es/og/work/01-evals.jpg`, url: `${site}/work/01-evals/` };
    expect(findStructuredDataProblems([{ path: 'es/work/01-evals/index.html', html: page(caseUrl, script({ ...article, author: { '@id': `${site}/#person` } })) }])).toEqual([
      { page: '/es/work/01-evals/', reason: 'author is not a Person' },
      { page: '/es/work/01-evals/', reason: 'author has no name' },
      { page: '/es/work/01-evals/', reason: 'author has no url' },
    ]);
    expect(findStructuredDataProblems([{ path: 'es/work/01-evals/index.html', html: page(caseUrl, script(stale)) }])).toEqual([
      { page: '/es/work/01-evals/', reason: `url ${site}/work/01-evals/ is not the page's ${caseUrl}` },
      { page: '/es/work/01-evals/', reason: `image ${site}/es/og/work/01-evals.jpg is not the og:image ${preview}` },
    ]);
  });
});
