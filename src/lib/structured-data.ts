const CONTEXT = 'https://schema.org';

const COUNTRIES: Record<string, string> = { Italy: 'IT' };

export function placeOf(city: string) {
  const [locality, country] = city.split(',').map((part) => part.trim());
  const code = country ? COUNTRIES[country] : undefined;
  if (!locality || !code) throw new Error(`No country code for the profile city "${city}". Add it to src/lib/structured-data.ts`);
  return { city: locality, country: code };
}

export const personId = (site: string) => new URL('/#person', site).href;

export interface PersonInput {
  site: string;
  name: string;
  jobTitle: string;
  city: string;
  country: string;
  url: string;
  image: string;
  profiles: string[];
}

export interface ProfilePageInput {
  name: string;
  url: string;
  inLanguage: string;
  person: ReturnType<typeof personEntity>;
}

export interface CaseArticleInput {
  site: string;
  author: { name: string; url: string };
  headline: string;
  description: string;
  image: string;
  url: string;
  inLanguage: string;
}

export function personEntity({ site, name, jobTitle, city, country, url, image, profiles }: PersonInput) {
  return {
    '@type': 'Person',
    '@id': personId(site),
    name,
    jobTitle,
    address: { '@type': 'PostalAddress', addressLocality: city, addressCountry: country },
    url,
    image,
    sameAs: profiles,
  };
}

export function profilePage({ name, url, inLanguage, person }: ProfilePageInput) {
  return { '@context': CONTEXT, '@type': 'ProfilePage', name, url, inLanguage, mainEntity: person };
}

export function caseArticle({ site, author, headline, description, image, url, inLanguage }: CaseArticleInput) {
  return {
    '@context': CONTEXT,
    '@type': 'Article',
    headline,
    description,
    image,
    url,
    mainEntityOfPage: url,
    inLanguage,
    author: { '@type': 'Person', '@id': personId(site), ...author },
  };
}

export const toJsonLd = (data: object) => JSON.stringify(data).replaceAll('<', '\\u003c');
