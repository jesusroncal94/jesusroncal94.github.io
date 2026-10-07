import { readdir, readFile } from 'node:fs/promises';
import { findStructuredDataProblems } from '../src/lib/structured-data-check';

const DIST = 'dist';

const paths = (await readdir(DIST, { recursive: true, withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
  .map((entry) => `${entry.parentPath}/${entry.name}`.slice(DIST.length + 1).replaceAll('\\', '/'));

const files = await Promise.all(paths.map(async (path) => ({ path, html: await readFile(`${DIST}/${path}`, 'utf8') })));

const problems = findStructuredDataProblems(files);

if (problems.length) {
  for (const { page, reason } of problems) console.error(`${page}  ${reason}`);
  console.error(`${problems.length} structured data problem(s)`);
  process.exit(1);
}

console.log(`Checked structured data in ${files.length} pages: all valid`);
