export const THEME_KEY = 'theme';

export type ThemeChoice = 'light' | 'dark' | 'system';

// Storage can be missing or throw (private windows, blocked site data): both mean "follow the system".
type StorageGetter = () => Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null | undefined;

const isExplicit = (value: unknown): value is 'light' | 'dark' => value === 'light' || value === 'dark';

export function readChoice(storage: StorageGetter): ThemeChoice {
  try {
    const value = storage()?.getItem(THEME_KEY);
    return isExplicit(value) ? value : 'system';
  } catch {
    return 'system';
  }
}

export function applyChoice(root: Pick<Element, 'setAttribute' | 'removeAttribute'>, storage: StorageGetter, choice: ThemeChoice) {
  if (choice === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', choice);
  try {
    if (choice === 'system') storage()?.removeItem(THEME_KEY);
    else storage()?.setItem(THEME_KEY, choice);
  } catch {
    // The choice holds for this page; it just won't be remembered.
  }
}

// Inlined in <head> as source text, so it must not reference anything outside itself. A page that
// pins its theme (the CV, the preview cards) already carries data-theme and is left alone.
export function bootTheme() {
  const root = document.documentElement;
  if (root.hasAttribute('data-theme')) return;
  try {
    const value = localStorage.getItem('theme');
    if (value === 'light' || value === 'dark') root.setAttribute('data-theme', value);
  } catch {
    // Follow the system.
  }
}
