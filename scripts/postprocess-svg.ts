import { readdir, readFile, writeFile } from 'node:fs/promises';
import { postprocessSvg } from '../src/lib/svg';

// Prepares the SVGs exported from Penpot for the repository (./tasks.ps1 diagrams).
const DIRECTORY = 'docs/diagrams';

for (const name of (await readdir(DIRECTORY)).filter((file) => file.endsWith('.svg'))) {
  const path = `${DIRECTORY}/${name}`;
  const before = await readFile(path, 'utf8');
  const after = postprocessSvg(before);
  if (after !== before) await writeFile(path, after);
  console.log(`${after === before ? 'unchanged' : 'processed'} ${path}`);
}
