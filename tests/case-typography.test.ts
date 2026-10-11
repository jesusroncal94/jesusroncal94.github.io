import { readdirSync, readFileSync } from 'node:fs';
import { load } from 'js-yaml';
import { expect, it } from 'vitest';

const CASES = 'src/content/cases/es';

// In the diagrams' short lines, a plain space before "%" lets "100 %" split across two lines.
it('keeps a non-breaking space before % in the Spanish case diagrams', () => {
  const plain = readdirSync(CASES).flatMap((file) => {
    const [, frontMatter] = readFileSync(`${CASES}/${file}`, 'utf8').split(/^---$/m);
    const { mechanism } = load(frontMatter) as { mechanism?: { stages: { detail: string; sentence: string }[] } };
    return (mechanism?.stages ?? [])
      .flatMap(({ detail, sentence }) => [detail, sentence])
      .filter((text) => / %/.test(text))
      .map((text) => `${file}: ${text}`);
  });
  expect(plain).toEqual([]);
});
