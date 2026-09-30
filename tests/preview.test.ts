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

describe('versionPreviewUrls in a locale', () => {
  it('versions a preview image under a locale prefix', () => {
    const html = '<meta property="og:image" content="https://site.invalid/es/og/home.jpg" />';
    expect(versionPreviewUrls(html, new Map([['/es/og/home.jpg', 'a1b2c3d4']]))).toBe(
      '<meta property="og:image" content="https://site.invalid/es/og/home.jpg?v=a1b2c3d4" />',
    );
  });
});
