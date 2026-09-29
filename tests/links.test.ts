import { describe, expect, it } from 'vitest';
import { findBrokenLinks } from '../src/lib/links';

describe('findBrokenLinks', () => {
  it('reports links whose page or id does not exist on the page they resolve to', () => {
    const home = { path: 'index.html', html: '<section id="work"></section><a href="#work">Work</a>' };
    const casePage = {
      path: 'work/01-evals/index.html',
      html: '<a href="/#work">All work</a><a href="#work">Work</a><a href="/cv/cv.pdf">CV</a><a href="/missing/">x</a><a href="mailto:a@b.c">Email</a>',
    };

    expect(findBrokenLinks([home, casePage, { path: 'cv/cv.pdf' }])).toEqual([
      { page: '/work/01-evals/', href: '#work', reason: 'missing id' },
      { page: '/work/01-evals/', href: '/missing/', reason: 'missing page' },
    ]);
  });
});
