import { describe, expect, it } from 'vitest';
import { currentSection } from '../src/lib/active-section';

const sections = [
  { id: 'work', top: 100, bottom: 1500 },
  { id: 'open-source', top: 1500, bottom: 2900 },
  { id: 'experience', top: 2900, bottom: 3700 },
];

describe('currentSection', () => {
  it('picks the section that contains the line', () => {
    expect(currentSection(800, sections)).toBe('work');
    expect(currentSection(2000, sections)).toBe('open-source');
    expect(currentSection(3000, sections)).toBe('experience');
  });

  it('counts a top edge in and a bottom edge out', () => {
    expect(currentSection(100, sections)).toBe('work');
    expect(currentSection(1500, sections)).toBe('open-source');
    expect(currentSection(3700, sections)).toBeUndefined();
  });

  it('marks nothing outside the linked sections', () => {
    expect(currentSection(99, sections)).toBeUndefined();
    expect(currentSection(5000, sections)).toBeUndefined();
    expect(currentSection(1600, [sections[0], sections[2]])).toBeUndefined();
    expect(currentSection(800, [])).toBeUndefined();
  });
});
