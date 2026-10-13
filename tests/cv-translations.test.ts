import { readFileSync } from 'node:fs';
import { load } from 'js-yaml';
import { describe, expect, it } from 'vitest';
import profile from '../data/public-profile.json';
import { cvSources, cvText, translationGaps, type CvTranslations } from '../src/lib/cv-text';
import type { PublicProfile } from '../src/lib/profile/schema';

const spanish = (load(readFileSync('src/content/site/es.yaml', 'utf8')) as { cv: CvTranslations }).cv;
const exported = profile as PublicProfile;

describe('Spanish CV', () => {
  it('has a reviewed translation for every exported text, and none left over', () => {
    expect(cvSources(exported)).toHaveLength(25);
    expect(translationGaps(exported, spanish)).toEqual({ missing: [], stale: [] });
  });

  it('catches an English text that changed after it was translated', () => {
    const changed = structuredClone(exported);
    changed.roles[0].bullets![0] += ' Now also in Chile.';
    const gaps = translationGaps(changed, spanish);
    expect(gaps.missing).toEqual([changed.roles[0].bullets![0]]);
    expect(gaps.stale).toEqual([exported.roles[0].bullets![0]]);
  });

  it('stops the page on a text without a translation', () => {
    expect(() => cvText('A sentence nobody translated.', spanish)).toThrow(/No reviewed translation/);
    expect(cvText(exported.summary!, spanish)).toBe(spanish.summary.text);
  });
});
