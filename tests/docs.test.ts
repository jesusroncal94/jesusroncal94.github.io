import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { describe, expect, it } from 'vitest';
import { svgColours } from '../src/lib/svg';

const DOCS = 'docs';
const DIAGRAMS = `${DOCS}/diagrams`;
const DESIGN = `${DOCS}/design/README.md`;

const markdownFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? markdownFiles(join(directory, entry.name)) : entry.name.endsWith('.md') ? [join(directory, entry.name)] : [],
  );

const read = (path: string) => readFileSync(path, 'utf8');
const links = (markdown: string) => [...markdown.matchAll(/\]\(([^)\s]+)\)/g)].map(([, target]) => target);
const local = (target: string) => !/^(https?:|mailto:|#)/.test(target);

const manifest = () => {
  const section = read(DESIGN).split(/^## /m).find((part) => part.startsWith('Manifest'))!;
  return section
    .split('\n')
    .filter((line) => line.startsWith('|') && !/^\|\s*(Penpot page|-)/.test(line))
    .map((line) => {
      const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
      return { board: cells[1], file: links(cells[2])[0]?.split('/').pop(), usedIn: links(cells[3])[0] };
    });
};

const svgs = () => readdirSync(DIAGRAMS).filter((name) => name.endsWith('.svg'));
const tokens = () => new Set([...read('src/styles/tokens.css').matchAll(/#[0-9a-f]{6}/gi)].map(([hex]) => hex.toLowerCase()));

describe('docs', () => {
  it('lists every published diagram in the manifest, and publishes every diagram it lists', () => {
    const listed = manifest().map(({ file }) => file).sort();
    expect(listed).toEqual(svgs().sort());
    for (const { board, file } of manifest()) expect(file).toBe(`${board}.svg`);
  });

  it('shows every diagram on the page the manifest names', () => {
    for (const { file, usedIn } of manifest()) {
      const page = normalize(join(dirname(DESIGN), usedIn));
      expect(existsSync(page), `${usedIn} exists`).toBe(true);
      expect(read(page), `${page} embeds ${file}`).toMatch(new RegExp(`!\\[[^\\]]+\\]\\([^)]*diagrams/${file}\\)`));
    }
  });

  it.each(svgs())('publishes %s without a web font, a script or a remote resource', (name) => {
    const svg = read(`${DIAGRAMS}/${name}`);
    expect(svg).not.toMatch(/@font-face/);
    expect(svg).not.toMatch(/<script/i);
    expect(svg).not.toMatch(/url\(\s*["']?https?:/i);
  });

  it.each(svgs())('paints %s with the site’s tokens only', (name) => {
    const allowed = tokens();
    expect(svgColours(read(`${DIAGRAMS}/${name}`)).filter((colour) => !allowed.has(colour))).toEqual([]);
  });

  it('has no broken relative link in the documentation or the README', () => {
    const broken = [...markdownFiles(DOCS), 'README.md'].flatMap((file) =>
      links(read(file))
        .filter(local)
        .map((target) => target.split('#')[0])
        .filter((target) => target && !existsSync(normalize(join(dirname(file), target))))
        .map((target) => `${file} → ${target}`),
    );
    expect(broken).toEqual([]);
  });
});
