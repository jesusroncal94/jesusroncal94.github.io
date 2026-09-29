import { describe, expect, it } from 'vitest';
import { findMissingPreviews } from '../src/lib/previews';

const head = (tags: string) => `<html><head>${tags}</head></html>`;
const complete = [
  '<meta property="og:image" content="https://site.invalid/og/home.jpg" />',
  '<meta property="og:image:width" content="1200" />',
  '<meta property="og:image:height" content="630" />',
  '<meta property="og:image:alt" content="A card" />',
  '<meta name="twitter:card" content="summary_large_image" />',
].join('');

describe('findMissingPreviews', () => {
  it('passes complete and noindex pages, and reports bare pages and heavy images', () => {
    const files = [
      { path: 'index.html', html: head(complete) },
      { path: 'cv/index.html', html: head('<meta name="robots" content="noindex" />') },
      { path: 'work/01-evals/index.html', html: head('<meta name="twitter:card" content="summary" />') },
      { path: 'og/home.jpg', size: 90 * 1024 },
      { path: 'og/work/01-evals.jpg', size: 310 * 1024 },
    ];

    expect(findMissingPreviews(files)).toEqual([
      { page: '/work/01-evals/', reason: 'no og:image' },
      { page: '/work/01-evals/', reason: 'no og:image:width' },
      { page: '/work/01-evals/', reason: 'no og:image:height' },
      { page: '/work/01-evals/', reason: 'no og:image:alt' },
      { page: '/work/01-evals/', reason: 'twitter:card is not summary_large_image' },
      { page: '/og/work/01-evals.jpg', reason: '310 KB, over 300 KB' },
    ]);
  });
});
