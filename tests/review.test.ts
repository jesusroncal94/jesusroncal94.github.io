import { readdirSync, readFileSync } from 'node:fs';
import { load } from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { es as profileEs } from '../src/i18n/profile/es';
import { es as uiEs } from '../src/i18n/ui/es';

interface Row {
  section: string;
  key: string;
  spanish: string;
  status: string;
}

const REVIEW = 'spdd/reviews/004a-es.md';
const CASES = 'src/content/cases/es';

const cells = (line: string) => line.split('|').slice(1, -1).map((cell) => cell.trim());
const CHOICE_TAG = /\s*\(C\d+\)$/;

const withoutAnnotations = (spanish: string, english: string) => {
  const text = spanish.replace(/\s*\*\(approved[^)]*\)\*/, '');
  return CHOICE_TAG.test(english) ? text : text.replace(CHOICE_TAG, '');
};
const normalise = (text: string) => text.replace(/\s+/g, ' ').trim();

function reviewRows(): Row[] {
  let section = '';
  const rows: Row[] = [];
  for (const line of readFileSync(REVIEW, 'utf8').split('\n')) {
    if (line.startsWith('## ')) section = line.slice(3);
    if (!line.startsWith('|') || /^\|\s*-/.test(line)) continue;
    const row = cells(line);
    if (section.startsWith('Profile values') && row.length === 3 && row[2] !== 'Status') {
      rows.push({ section, key: row[0], spanish: withoutAnnotations(row[1], row[0]), status: row[2] });
    } else if (row.length === 4 && row[0].startsWith('`')) {
      rows.push({ section, key: row[0].replaceAll('`', ''), spanish: withoutAnnotations(row[2], row[1]), status: row[3] });
    }
  }
  return rows;
}

function atPath(root: unknown, path: string): unknown {
  return path
    .split(/[.[\]]/)
    .filter(Boolean)
    .reduce<unknown>((node, segment) => (node as Record<string, unknown>)[segment], root);
}

const site = load(readFileSync('src/content/site/es.yaml', 'utf8')) as Record<string, unknown> & {
  cv: { highlights: { roleId: string; items: string[] }[] };
};

function caseEntry(number: string) {
  const file = readdirSync(CASES).find((name) => name.startsWith(`${number}-`))!;
  const [, frontMatter, body] = readFileSync(`${CASES}/${file}`, 'utf8').split(/^---$/m);
  const parts = body.split(/<h2 id="(\w+)">[^<]*<\/h2>/);
  const sections: Record<string, string[]> = {};
  for (let index = 1; index < parts.length; index += 2) {
    sections[parts[index]] = parts[index + 1].trim().split(/\n\s*\n/).map(normalise);
  }
  return { data: load(frontMatter) as Record<string, unknown>, sections };
}

function contentFor({ section, key }: Row): unknown {
  if (section.startsWith('UI strings')) return uiEs[key as keyof typeof uiEs];
  if (section.startsWith('Profile values')) return profileEs[key];
  const highlight = /^cv\.highlights\.([\w-]+)\[(\d+)\]$/.exec(key);
  if (highlight) return site.cv.highlights.find(({ roleId }) => roleId === highlight[1])?.items[Number(highlight[2])];
  const caseKey = /^(\d\d)\.(.+)$/.exec(key);
  if (!caseKey) return atPath(site, key);
  const { data, sections } = caseEntry(caseKey[1]);
  const body = /^body\.(\w+)\[(\d+)\]$/.exec(caseKey[2]);
  if (body) return sections[body[1]]?.[Number(body[2])];
  const value = data[caseKey[2]];
  return Array.isArray(value) ? value.join(', ') : value;
}

const rows = reviewRows();

describe('Spanish review', () => {
  it('covers every UI key and every profile value', () => {
    const reviewed = new Set(rows.map(({ key }) => key));
    expect(Object.keys(uiEs).filter((key) => !reviewed.has(key))).toEqual([]);
    expect(Object.keys(profileEs).filter((key) => !reviewed.has(key))).toEqual([]);
  });

  it.each(rows.map((row) => [row.key, row] as const))('%s is approved and shipped as reviewed', (_, row) => {
    expect(row.status).toBe('ok');
    expect(normalise(String(contentFor(row)))).toBe(normalise(row.spanish));
  });
});
