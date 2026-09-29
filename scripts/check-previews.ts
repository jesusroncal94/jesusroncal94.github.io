import { readdir, readFile, stat } from 'node:fs/promises';
import { findMissingPreviews } from '../src/lib/previews';

const DIST = 'dist';

const paths = (await readdir(DIST, { recursive: true, withFileTypes: true }))
  .filter((entry) => entry.isFile())
  .map((entry) => `${entry.parentPath}/${entry.name}`.slice(DIST.length + 1).replaceAll('\\', '/'));

const files = await Promise.all(
  paths.map(async (path) => ({
    path,
    size: (await stat(`${DIST}/${path}`)).size,
    html: path.endsWith('.html') ? await readFile(`${DIST}/${path}`, 'utf8') : undefined,
  })),
);

const missing = findMissingPreviews(files);

if (missing.length) {
  for (const { page, reason } of missing) console.error(`${page}  ${reason}`);
  console.error(`${missing.length} link preview problem(s)`);
  process.exit(1);
}

console.log(`Checked link previews in ${files.filter((file) => file.html).length} pages: all complete`);
