import { describe, expect, it } from 'vitest';
import { caseArticle, personEntity, placeOf, profilePage, toJsonLd } from '../src/lib/structured-data';

const site = 'https://example.github.io';
const person = personEntity({
  site,
  name: 'Ada Example',
  jobTitle: 'AI & Backend Engineer',
  city: 'Milan',
  country: 'IT',
  url: 'https://example.github.io/',
  image: 'https://example.github.io/_astro/portrait.webp',
  profiles: ['https://www.linkedin.com/in/ada', 'https://github.com/ada'],
});

describe('structured data', () => {
  it('describes the person with a shared id, the place and the profiles', () => {
    expect(person).toEqual({
      '@type': 'Person',
      '@id': 'https://example.github.io/#person',
      name: 'Ada Example',
      jobTitle: 'AI & Backend Engineer',
      address: { '@type': 'PostalAddress', addressLocality: 'Milan', addressCountry: 'IT' },
      url: 'https://example.github.io/',
      image: 'https://example.github.io/_astro/portrait.webp',
      sameAs: ['https://www.linkedin.com/in/ada', 'https://github.com/ada'],
    });
  });

  it('wraps the person in a profile page', () => {
    expect(profilePage({ name: 'Ada Example — AI Engineer', url: 'https://example.github.io/es/', inLanguage: 'es', person })).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      inLanguage: 'es',
      mainEntity: { '@id': 'https://example.github.io/#person' },
    });
  });

  it('writes a case as an article by the same person', () => {
    expect(
      caseArticle({
        site,
        headline: 'A case',
        description: 'What happened.',
        image: 'https://example.github.io/og/work/01-case.jpg?v=abc12345',
        url: 'https://example.github.io/work/01-case/',
        inLanguage: 'en',
      }),
    ).toMatchObject({ '@type': 'Article', headline: 'A case', mainEntityOfPage: 'https://example.github.io/work/01-case/', author: { '@id': 'https://example.github.io/#person' } });
  });

  it('splits the profile city into a locality and a country code', () => {
    expect(placeOf('Milan, Italy')).toEqual({ city: 'Milan', country: 'IT' });
  });

  it('fails on a city whose country has no code', () => {
    expect(() => placeOf('Lima, Peru')).toThrow('Lima, Peru');
  });

  it('keeps a closing script tag in the content inside the string', () => {
    const json = toJsonLd({ description: 'Ends with </script><script>alert(1)</script>' });
    expect(json).not.toContain('</script>');
    expect(JSON.parse(json).description).toBe('Ends with </script><script>alert(1)</script>');
  });
});
