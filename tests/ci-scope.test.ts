import { describe, expect, it } from 'vitest';
import { isDocumentationOnly } from '../src/lib/ci-scope';

describe('isDocumentationOnly', () => {
  it('is true when every changed path is an SPDD artefact, the README or CLAUDE.md', () => {
    expect(isDocumentationOnly(['spdd/canvases/010-ship-without-waiting.md', 'README.md', 'CLAUDE.md'])).toBe(true);
  });

  it('is false as soon as one path can reach the site, Markdown content included', () => {
    expect(isDocumentationOnly(['spdd/stories/README.md', 'src/content/cases/en/02-cost-leak.md'])).toBe(false);
  });

  it('is false when nothing changed, so an unknown diff runs every check', () => {
    expect(isDocumentationOnly([])).toBe(false);
  });
});
