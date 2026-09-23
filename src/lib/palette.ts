export type PaletteGroup = 'question' | 'case' | 'section' | 'repo' | 'action';

export interface PaletteEntry {
  id: string;
  group: PaletteGroup;
  label: string;
  keywords: string[];
  href: string;
  external?: boolean;
  groupLabel?: string;
}

const LABEL_MATCH = 2;
const KEYWORD_MATCH = 1;

export function rankEntries(query: string, entries: PaletteEntry[]): PaletteEntry[] {
  const terms = normalise(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return entries;

  return entries
    .map((entry, index) => ({ entry, index, score: score(entry, terms) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ entry }) => entry);
}

function score(entry: PaletteEntry, terms: string[]): number {
  const label = normalise(entry.label);
  const everything = `${label} ${normalise(entry.keywords.join(' '))}`;
  if (!terms.every((term) => everything.includes(term))) return 0;
  return terms.every((term) => label.includes(term)) ? LABEL_MATCH : KEYWORD_MATCH;
}

function normalise(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}
