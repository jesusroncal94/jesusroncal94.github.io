import { describe, expect, it } from 'vitest';
import { rankEntries, type PaletteEntry } from '../src/lib/palette';

const entries: PaletteEntry[] = [
  { id: 'case-01', group: 'case', label: 'Evals before vibes', keywords: ['prompt', 'quality'], href: '/work/01-evals/' },
  { id: 'case-02', group: 'case', label: 'Finding the AI spend nobody could explain', keywords: ['cost', 'ledger'], href: '/work/02-cost-leak/' },
  { id: 'section-work', group: 'section', label: 'Selected work', keywords: [], href: '/#work' },
];

describe('rankEntries', () => {
  it('finds the case a visitor is looking for', () => {
    expect(rankEntries('cost', entries)[0].href).toBe('/work/02-cost-leak/');
    expect(rankEntries('', entries)).toHaveLength(3);
  });
});
