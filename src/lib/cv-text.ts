import type { PublicProfile } from './profile/schema';

export interface Translation {
  source: string;
  text: string;
}

export interface CvTranslations {
  summary: Translation;
  bullets: Translation[];
}

// Every English text of the CV, in the order the CV shows it.
export const cvSources = (profile: PublicProfile) => [
  profile.summary ?? '',
  ...profile.roles.flatMap((role) => role.bullets ?? []),
];

// Exported texts without a reviewed translation, and translations whose English is no longer exported.
export function translationGaps(profile: PublicProfile, translations: CvTranslations) {
  const sources = cvSources(profile);
  const translated = [translations.summary, ...translations.bullets].map(({ source }) => source);
  return {
    missing: sources.filter((source) => !translated.includes(source)),
    stale: translated.filter((source) => !sources.includes(source)),
  };
}

// The CV text in the page's language; a text without a reviewed translation stops the build.
export function cvText(source: string, translations: CvTranslations | undefined) {
  if (!translations) return source;
  const match = [translations.summary, ...translations.bullets].find((entry) => entry.source === source);
  if (!match) throw new Error(`No reviewed translation for the CV text: ${source.slice(0, 60)}…`);
  return match.text;
}
