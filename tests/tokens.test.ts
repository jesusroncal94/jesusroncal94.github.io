import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync('src/styles/tokens.css', 'utf8');
const colours = Object.fromEntries(
  [...css.matchAll(/--color-([\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]),
);
const sides = (name: string) => {
  const match = /^light-dark\((#[0-9a-f]{6}),\s*(#[0-9a-f]{6})\)$/i.exec(colours[name]);
  return match ? { light: match[1], dark: match[2] } : undefined;
};

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const channel = parseInt(hex.slice(i, i + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
};

const TEXT = ['primary', 'muted', 'subtle', 'signal', 'glow', 'before'];
const BACKGROUNDS = ['canvas', 'surface', 'raised'];

describe('colour tokens', () => {
  it('give every colour a light and a dark value', () => {
    expect(Object.keys(colours).length).toBeGreaterThanOrEqual(13);
    expect(Object.keys(colours).filter((name) => !sides(name))).toEqual([]);
  });

  it.each(['light', 'dark'] as const)('keep every text colour at AA on every background, %s', (mode) => {
    const failures = TEXT.flatMap((text) =>
      BACKGROUNDS.map((background) => [text, background, contrast(sides(text)![mode], sides(background)![mode])] as const),
    ).filter(([, , ratio]) => ratio < 4.5);
    expect(failures).toEqual([]);
    expect(contrast(sides('on-signal')![mode], sides('signal')![mode])).toBeGreaterThanOrEqual(4.5);
  });
});
