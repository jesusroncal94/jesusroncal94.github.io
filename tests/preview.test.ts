import { describe, expect, it } from 'vitest';
import { versionPreviewUrls } from '../src/lib/preview';

describe('versionPreviewUrls', () => {
  it('appends the content version to known preview images', () => {
    const html = '<meta property="og:image" content="https://site.invalid/og/work/01-evals.jpg" /><a href="/og/work/01-evals.jpg">';
    expect(versionPreviewUrls(html, new Map([['/og/work/01-evals.jpg', '3f9a1c2e']]))).toBe(
      '<meta property="og:image" content="https://site.invalid/og/work/01-evals.jpg?v=3f9a1c2e" /><a href="/og/work/01-evals.jpg">',
    );
  });
});
