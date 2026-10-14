import { describe, expect, it } from 'vitest';
import { postprocessSvg, svgColours } from '../src/lib/svg';

const exported = [
  '<svg xmlns="http://www.w3.org/2000/svg">',
  '<style>@font-face { font-family: "Geist"; src: url("https://design.penpot.app/fonts/geist.woff2"); }</style>',
  '<style>.frame-clip { clip-path: none; }</style>',
  '<text style="font-family: Geist; font-size: 13px; fill: #1c1917;">Story</text>',
  '<text style="font-family: &quot;Geist Mono&quot;; fill: rgb(87, 83, 78);">FILE</text>',
  '<text font-family="Geist" fill="#FFF">Live</text>',
  '<rect fill="#faf8f5" stroke="#3F6212"/>',
  '</svg>',
].join('');

describe('postprocessSvg', () => {
  const out = postprocessSvg(exported);

  it('drops the web-font block and keeps other styles', () => {
    expect(out).not.toContain('@font-face');
    expect(out).not.toContain('penpot.app');
    expect(out).toContain('.frame-clip');
  });

  it('gives each family system fallbacks, in CSS and in attributes', () => {
    expect(out).toContain("font-family: Geist, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;");
    expect(out).toContain("font-family: 'Geist Mono', ui-monospace, Consolas, monospace;");
    expect(out).toContain(`font-family="Geist, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"`);
  });

  it('changes nothing when run again', () => {
    expect(postprocessSvg(out)).toBe(out);
  });
});

describe('svgColours', () => {
  it('lists every painted colour as lowercase #rrggbb', () => {
    expect(svgColours(exported).sort()).toEqual(['#1c1917', '#3f6212', '#57534e', '#faf8f5', '#ffffff']);
  });
});
