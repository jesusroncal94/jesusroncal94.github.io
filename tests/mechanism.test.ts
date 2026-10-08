import { describe, expect, it } from 'vitest';
import { GRID, leadingCount, stepAfter } from '../src/lib/mechanism';

describe('stepAfter', () => {
  it('moves one step inside the range', () => {
    expect(stepAfter(0, 1, 4)).toBe(1);
    expect(stepAfter(2, -1, 4)).toBe(1);
  });

  it('stays at the ends', () => {
    expect(stepAfter(0, -1, 4)).toBe(0);
    expect(stepAfter(3, 1, 4)).toBe(3);
  });
});

describe('leadingCount', () => {
  it('reads the number a metric starts with', () => {
    expect(leadingCount('112 queued')).toBe(112);
    expect(leadingCount('112 en cola')).toBe(112);
    expect(leadingCount('$15/day')).toBe(15);
  });

  it('has nothing to read in a value without a number', () => {
    expect(leadingCount('one story graph')).toBeUndefined();
  });

  it('matches the grid the glyphs draw', () => {
    expect(GRID.columns * GRID.rows).toBe(leadingCount('112 queued'));
  });
});
