export interface BuiltFile {
  path: string;
  html?: string;
  size?: number;
}

export interface BrokenLink {
  page: string;
  href: string;
  reason: 'missing page' | 'missing id';
}

const ORIGIN = 'https://site.invalid';
const EXTERNAL = /^([a-z][a-z0-9+.-]*:|\/\/)/i;

const hrefsIn = (html: string) => [...html.matchAll(/\shref="([^"]*)"/g)].map(([, href]) => href.replaceAll('&amp;', '&'));

const idsIn = (html: string) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(([, id]) => id));

const pagePath = (filePath: string) => `/${filePath.replace(/(^|\/)index\.html$/, '$1')}`;

function fileFor(pathname: string, files: Map<string, BuiltFile>) {
  const candidates = pathname.endsWith('/') ? [`${pathname}index.html`] : [pathname, `${pathname}/index.html`];
  return candidates.map((candidate) => files.get(candidate.slice(1))).find(Boolean);
}

export function findBrokenLinks(builtFiles: BuiltFile[]): BrokenLink[] {
  const files = new Map(builtFiles.map((file) => [file.path, file]));
  const pages = builtFiles.filter((file): file is Required<BuiltFile> => file.html !== undefined);

  return pages.flatMap(({ path, html }) => {
    const page = pagePath(path);
    return hrefsIn(html)
      .filter((href) => href !== '' && !EXTERNAL.test(href))
      .flatMap((href): BrokenLink[] => {
        const url = new URL(href, `${ORIGIN}${page}`);
        const target = fileFor(decodeURIComponent(url.pathname), files);
        if (!target) return [{ page, href, reason: 'missing page' }];
        const id = decodeURIComponent(url.hash.slice(1));
        if (id && !idsIn(target.html ?? '').has(id)) return [{ page, href, reason: 'missing id' }];
        return [];
      });
  });
}
