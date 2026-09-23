import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n/locales';

export type Case = CollectionEntry<'cases'>;

export async function getCases(locale: Locale): Promise<Case[]> {
  const cases = await getCollection('cases', ({ id }) => id.startsWith(`${locale}/`));
  return cases.sort((a, b) => a.data.order - b.data.order);
}

export function caseSlug(entry: Case): string {
  return entry.id.split('/').slice(1).join('/');
}

export function caseEyebrow({ data }: Case): string {
  return [String(data.order).padStart(2, '0'), data.product ?? data.organisation, data.role].join(' · ');
}
