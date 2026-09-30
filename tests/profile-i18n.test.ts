import { describe, expect, it } from 'vitest';
import { localiseProfile, MissingProfileTranslation } from '../src/i18n/profile';

describe('localiseProfile', () => {
  it('keeps English values and refuses to guess a missing translation', () => {
    expect(localiseProfile('Milan, Italy', 'en')).toBe('Milan, Italy');
    expect(() => localiseProfile('A value nobody translated', 'es')).toThrow(MissingProfileTranslation);
  });
});
