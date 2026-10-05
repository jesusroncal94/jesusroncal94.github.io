import { DEFAULT_LOCALE, isLocale } from '../i18n/locales';
import { suggestLocale } from '../lib/suggest-locale';

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

function hideCardWhileScrolled() {
  const card = document.querySelector<HTMLElement>('[data-suggestion-card]:not([hidden])');
  const bar = document.querySelector('header');
  if (!card || !bar) return;

  const update = () => card.toggleAttribute('data-away', scrollY > bar.getBoundingClientRect().height);
  update();
  addEventListener('scroll', update, { passive: true });
}

export function revealLocaleSuggestion() {
  const suggestions = [...document.querySelectorAll<HTMLElement>('[data-locale-suggestion]')];
  if (!suggestions.length) return;

  const published = (suggestions[0].dataset.published ?? '').split(' ').filter(isLocale);
  const target = suggestLocale(navigator.languages, published, wasDismissed());
  suggestions.forEach((suggestion) => (suggestion.hidden = suggestion.dataset.localeSuggestion !== target));

  hideCardWhileScrolled();

  document.addEventListener('click', (event) => {
    const element = event.target as Element;
    if (element.closest('[data-suggestion-dismiss]')) {
      rememberDismissal();
      suggestions.forEach((suggestion) => (suggestion.hidden = true));
    } else if (element.closest('[data-locale-suggestion] a')) {
      rememberDismissal();
    }
  });
}
