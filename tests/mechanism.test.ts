import { describe, expect, it } from 'vitest';
import { amountOf, GRID, hourglassOf, leadingCount, percentOf, stepAfter } from '../src/lib/mechanism';

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

describe('percentOf', () => {
  it('reads a percentage in either language', () => {
    expect(percentOf('45.6%')).toBe(45.6);
    expect(percentOf('45,6 %')).toBe(45.6);
    expect(percentOf('45,6 %')).toBe(45.6);
    expect(percentOf('100 %')).toBe(100);
    expect(percentOf('100%')).toBe(100);
  });

  it('refuses a value that is not a percentage', () => {
    expect(percentOf('112 queued')).toBeUndefined();
    expect(percentOf('$15/day')).toBeUndefined();
  });
});

describe('amountOf', () => {
  it('reads a dollar amount in either language', () => {
    expect(amountOf('$15/day')).toBe(15);
    expect(amountOf('$15/día')).toBe(15);
    expect(amountOf('$0')).toBe(0);
    expect(amountOf('$12–16')).toBe(12);
  });

  it('has nothing to read in a value without an amount', () => {
    expect(amountOf('112 queued')).toBeUndefined();
    expect(amountOf('45.6%')).toBeUndefined();
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

describe('hourglassOf', () => {
  const stages = [
    { glyph: 'channels', detail: '4 ways in' },
    { glyph: 'inbound', detail: '3 subagents' },
    { glyph: 'facts', detail: 'facts only' },
    { glyph: 'outbound', detail: '3 subagentes' },
  ];

  it('reads the segments from the stages', () => {
    expect(hourglassOf(stages)).toEqual({ channels: 4, inbound: 3, outbound: 3 });
  });

  it('has nothing to draw when a stage is missing', () => {
    expect(hourglassOf(stages.filter(({ glyph }) => glyph !== 'inbound'))).toBeUndefined();
  });

  it('has nothing to draw when a detail states no count', () => {
    expect(hourglassOf(stages.map((stage) => (stage.glyph === 'channels' ? { ...stage, detail: 'many ways in' } : stage)))).toBeUndefined();
  });
});
