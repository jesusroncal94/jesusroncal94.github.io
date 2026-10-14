import { applyChoice, readChoice, type ThemeChoice } from '../lib/theme';
import type { CONVERSION, Conversion } from '../lib/track';

const CONVERSION_EVENT: typeof CONVERSION = 'conversion';

const storage = () => window.localStorage;
const radios = () => [...document.querySelectorAll<HTMLInputElement>('[data-theme-switch] input[type="radio"]')];

// Every switch on the page (nav and phone menu) shows the same choice.
const show = (choice: ThemeChoice) => radios().forEach((radio) => (radio.checked = radio.value === choice));

show(readChoice(storage));

radios().forEach((radio) =>
  radio.addEventListener('change', () => {
    const choice = radio.value as ThemeChoice;
    applyChoice(document.documentElement, storage, choice);
    show(choice);
    const detail: Conversion = { event: 'theme_change', props: { choice } };
    document.dispatchEvent(new CustomEvent(CONVERSION_EVENT, { detail }));
  }),
);
