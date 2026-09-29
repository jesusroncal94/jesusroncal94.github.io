import { describe, expect, it } from 'vitest';
import { interpolate, useTranslations } from '../src/i18n/translate';

describe('interpolate', () => {
  it('fills the placeholders of a dictionary entry', () => {
    const t = useTranslations('en');
    expect(interpolate(t('og.caseAlt'), { title: 'Finding the AI spend', before: '$15/day', after: '$0' })).toBe(
      'Finding the AI spend: $15/day to $0. A case study by Jesús Roncal.',
    );
  });
});
