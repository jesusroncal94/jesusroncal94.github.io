import { describe, expect, it } from 'vitest';
import { formatMonth, formatNumber, formatPeriod } from '../src/i18n/format';
import { localePath, stripLocale } from '../src/i18n/locales';

describe('English formatting', () => {
  it('formats numbers, months and periods', () => {
    expect(formatNumber(12000, 'en', { notation: 'compact' })).toBe('12K');
    expect(formatMonth('2024-09', 'en')).toBe('Sep 2024');
    expect(formatPeriod('2024-09', null, 'en')).toBe('2024 — now');
    expect(formatPeriod('2022-01', '2024-11', 'en')).toBe('2022 — 2024');
  });

  it('builds locale-aware paths', () => {
    expect(localePath('en', 'work/01-evals')).toBe('/work/01-evals/');
    expect(localePath('es', 'work/01-evals')).toBe('/es/work/01-evals/');
    expect(localePath('en')).toBe('/');
    expect(stripLocale('/es/work/01-evals/')).toBe('work/01-evals');
  });
});
