import { readdir, readFile } from 'node:fs/promises';
import { findBrokenLinks } from '../src/lib/links';

const DIST = 'dist';

const paths = (await readdir(DIST, { recursive: true, withFileTypes: true }))
  .filter((entry) => entry.isFile())
  .map((entry) => `${entry.parentPath}/${entry.name}`.slice(DIST.length + 1).replaceAll('\\', '/'));

const files = await Promise.all(
  paths.map(async (path) => (path.endsWith('.html') ? { path, html: await readFile(`${DIST}/${path}`, 'utf8') } : { path })),
);

const broken = findBrokenLinks(files);

if (broken.length) {
  for (const { page, href, reason } of broken) console.error(`${page}  ${href}  (${reason})`);
  console.error(`${broken.length} broken internal link(s)`);
  process.exit(1);
}

console.log(`Checked internal links in ${files.filter((file) => file.html).length} pages: none broken`);
