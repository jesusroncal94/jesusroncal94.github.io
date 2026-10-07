import { LOCALES } from '../i18n/locales';
import type { BuiltFile } from './links';
import { personId } from './structured-data';

export interface StructuredDataProblem {
  page: string;
  reason: string;
}

type BuiltPage = BuiltFile & { html: string };
type Block = Record<string, unknown>;

const PREFIX = `(?:(?:${LOCALES.join('|')})/)?`;
const HOME = new RegExp(`^${PREFIX}index\\.html$`);
const CASE = new RegExp(`^${PREFIX}work/[^/]+/index\\.html$`);

const PERSON_FIELDS = ['name', 'jobTitle', 'url', 'image'] as const;
const ARTICLE_FIELDS = ['headline', 'description', 'image', 'url', 'inLanguage'] as const;
// Google does not follow the @id to the home page, so the author names itself.
const AUTHOR_FIELDS = ['name', 'url'] as const;

const meta = (html: string, property: string) =>
  html.match(new RegExp(`<meta property="${property}" content="([^"]*)"`))?.[1];

const blocksIn = (html: string) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(([, json]) => json);

const isFilled = (value: unknown) => typeof value === 'string' && value.trim() !== '';

const missingFields = (block: Block, fields: readonly string[]) => fields.filter((field) => !isFilled(block[field]));

function problemsOf(block: Block, kind: 'home' | 'case', html: string): string[] {
  const pageUrl = meta(html, 'og:url');
  if (!pageUrl) return ['no og:url to check the block against'];
  const id = personId(pageUrl);
  const problems: string[] = [];

  if (block['@context'] !== 'https://schema.org') problems.push('@context is not https://schema.org');
  if (block.url !== pageUrl) problems.push(`url ${String(block.url)} is not the page's ${pageUrl}`);

  if (kind === 'home') {
    if (block['@type'] !== 'ProfilePage') problems.push(`@type is ${String(block['@type'])}, not ProfilePage`);
    const person = (block.mainEntity ?? {}) as Block;
    if (person['@type'] !== 'Person') problems.push('mainEntity is not a Person');
    if (person['@id'] !== id) problems.push(`person @id is ${String(person['@id'])}, not ${id}`);
    problems.push(...missingFields(person, PERSON_FIELDS).map((field) => `person has no ${field}`));
    const profiles = person.sameAs;
    if (!Array.isArray(profiles) || profiles.length === 0 || !profiles.every(isFilled)) problems.push('person has no sameAs profiles');
    return problems;
  }

  if (block['@type'] !== 'Article') problems.push(`@type is ${String(block['@type'])}, not Article`);
  problems.push(...missingFields(block, ARTICLE_FIELDS).map((field) => `article has no ${field}`));
  const author = (block.author ?? {}) as Block;
  if (author['@type'] !== 'Person') problems.push('author is not a Person');
  if (author['@id'] !== id) problems.push(`author is not ${id}`);
  problems.push(...missingFields(author, AUTHOR_FIELDS).map((field) => `author has no ${field}`));
  const image = meta(html, 'og:image');
  if (block.image !== image) problems.push(`image ${String(block.image)} is not the og:image ${String(image)}`);
  return problems;
}

function problemsOfPage({ path, html }: BuiltPage): StructuredDataProblem[] {
  const page = `/${path.replace(/(^|\/)index\.html$/, '$1')}`;
  const kind = HOME.test(path) ? 'home' : CASE.test(path) ? 'case' : undefined;
  const blocks = blocksIn(html);

  if (!kind) return blocks.length ? [{ page, reason: `${blocks.length} structured data block(s) where none belongs` }] : [];
  if (blocks.length !== 1) return [{ page, reason: `${blocks.length} structured data blocks, expected 1` }];

  let block: Block;
  try {
    block = JSON.parse(blocks[0]) as Block;
  } catch {
    return [{ page, reason: 'the structured data block is not valid JSON' }];
  }
  return problemsOf(block, kind, html).map((reason) => ({ page, reason }));
}

export function findStructuredDataProblems(builtFiles: BuiltFile[]): StructuredDataProblem[] {
  return builtFiles.filter((file): file is BuiltPage => file.html !== undefined).flatMap(problemsOfPage);
}
