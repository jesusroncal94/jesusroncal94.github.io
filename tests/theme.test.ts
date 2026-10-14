import { afterEach, describe, expect, it, vi } from 'vitest';
import { applyChoice, bootTheme, readChoice, THEME_KEY } from '../src/lib/theme';

const memory = (initial: Record<string, string> = {}) => {
  const items = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
    removeItem: (key: string) => void items.delete(key),
    items,
  };
};
const blocked = () => {
  throw new Error('SecurityError');
};
const element = (attributes: Record<string, string> = {}) => {
  const map = new Map(Object.entries(attributes));
  return {
    setAttribute: (name: string, value: string) => void map.set(name, value),
    removeAttribute: (name: string) => void map.delete(name),
    hasAttribute: (name: string) => map.has(name),
    map,
  };
};

afterEach(() => vi.unstubAllGlobals());

describe('readChoice', () => {
  it('reads a stored light or dark choice', () => {
    expect(readChoice(() => memory({ [THEME_KEY]: 'light' }))).toBe('light');
    expect(readChoice(() => memory({ [THEME_KEY]: 'dark' }))).toBe('dark');
  });

  it('follows the system when nothing, something else, or no storage is there', () => {
    expect(readChoice(() => memory())).toBe('system');
    expect(readChoice(() => memory({ [THEME_KEY]: 'sepia' }))).toBe('system');
    expect(readChoice(blocked)).toBe('system');
  });
});

describe('applyChoice', () => {
  it('pins and stores an explicit choice', () => {
    const [root, storage] = [element(), memory()];
    applyChoice(root, () => storage, 'light');
    expect(root.map.get('data-theme')).toBe('light');
    expect(storage.items.get(THEME_KEY)).toBe('light');
  });

  it('returns to the system and forgets the choice', () => {
    const [root, storage] = [element({ 'data-theme': 'dark' }), memory({ [THEME_KEY]: 'dark' })];
    applyChoice(root, () => storage, 'system');
    expect(root.map.has('data-theme')).toBe(false);
    expect(storage.items.has(THEME_KEY)).toBe(false);
  });

  it('still switches the page when storage is blocked', () => {
    const root = element();
    applyChoice(root, blocked, 'dark');
    expect(root.map.get('data-theme')).toBe('dark');
  });
});

describe('bootTheme', () => {
  const boot = (stored: Record<string, string>, attributes: Record<string, string> = {}) => {
    const root = element(attributes);
    vi.stubGlobal('document', { documentElement: root });
    vi.stubGlobal('localStorage', memory(stored));
    bootTheme();
    return root.map.get('data-theme');
  };

  it('applies a stored choice before the first paint', () => {
    expect(boot({ [THEME_KEY]: 'light' })).toBe('light');
    expect(boot({})).toBeUndefined();
  });

  it('leaves a page that pins its theme alone', () => {
    expect(boot({ [THEME_KEY]: 'dark' }, { 'data-theme': 'light' })).toBe('light');
  });

  it('uses the same key as the switch', () => {
    expect(bootTheme.toString()).toMatch(new RegExp(`getItem\\(['"]${THEME_KEY}['"]\\)`));
  });
});
