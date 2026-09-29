import type { BuiltFile } from './links';

export interface MissingPreview {
  page: string;
  reason: string;
}

export const PREVIEW_MAX_BYTES = 300 * 1024;

const REQUIRED_TAGS = ['og:image', 'og:image:width', 'og:image:height', 'og:image:alt'] as const;

function metaTags(html: string) {
  const tags = new Map<string, string>();
  for (const [tag] of html.matchAll(/<meta\s[^>]*>/g)) {
    const attribute = (name: string) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
    const key = attribute('property') ?? attribute('name');
    const content = attribute('content');
    if (key && content !== undefined) tags.set(key, content);
  }
  return tags;
}

type BuiltPage = BuiltFile & { html: string };

function missingFromPage({ path, html }: BuiltPage, files: Set<string>): MissingPreview[] {
  const tags = metaTags(html);
  if (tags.get('robots')?.includes('noindex')) return [];

  const page = `/${path.replace(/(^|\/)index\.html$/, '$1')}`;
  const missing: MissingPreview[] = REQUIRED_TAGS.filter((tag) => !tags.get(tag)).map((tag) => ({ page, reason: `no ${tag}` }));
  if (tags.get('twitter:card') !== 'summary_large_image') missing.push({ page, reason: 'twitter:card is not summary_large_image' });

  const image = tags.get('og:image');
  if (image && !files.has(new URL(image).pathname.slice(1))) missing.push({ page, reason: `image not built: ${image}` });
  return missing;
}

export function findMissingPreviews(builtFiles: BuiltFile[]): MissingPreview[] {
  const files = new Set(builtFiles.map(({ path }) => path));
  const pages = builtFiles.filter((file): file is BuiltPage => file.html !== undefined);
  const heavy = builtFiles
    .filter(({ path, size = 0 }) => path.startsWith('og/') && size >= PREVIEW_MAX_BYTES)
    .map(({ path, size = 0 }) => ({ page: `/${path}`, reason: `${Math.round(size / 1024)} KB, over ${PREVIEW_MAX_BYTES / 1024} KB` }));

  return [...pages.flatMap((page) => missingFromPage(page, files)), ...heavy];
}
