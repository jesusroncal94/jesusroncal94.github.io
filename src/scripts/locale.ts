import { DEFAULT_LOCALE } from '../i18n/locales';

const DISMISSED_KEY = 'locale-suggestion';

export function rememberDismissal() {
  try {
    localStorage.setItem(DISMISSED_KEY, 'dismissed');
  } catch {
    return;
  }
}

export function wasDismissed() {
  try {
    return localStorage.getItem(DISMISSED_KEY) === 'dismissed';
  } catch {
    return false;
  }
}

export function bindLocaleLinks() {
  document.addEventListener('click', (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[data-locale-link]');
    if (!link) return;
    if (link.dataset.localeLink === DEFAULT_LOCALE) rememberDismissal();
    if (location.hash) link.hash = location.hash;
  });
}
