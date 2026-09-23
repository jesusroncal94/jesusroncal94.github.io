import { describe, expect, it } from 'vitest';
import { splitNumeric } from '../src/lib/count-up';

describe('splitNumeric', () => {
  it('separates the animatable number from its text', () => {
    expect(splitNumeric('45.6%')).toEqual({ prefix: '', number: 45.6, decimals: 1, suffix: '%' });
    expect(splitNumeric('$15/day')).toEqual({ prefix: '$', number: 15, decimals: 0, suffix: '/day' });
    expect(splitNumeric('112 queued')).toEqual({ prefix: '', number: 112, decimals: 0, suffix: ' queued' });
    expect(splitNumeric('7 agents')).toEqual({ prefix: '', number: 7, decimals: 0, suffix: ' agents' });
  });
});
