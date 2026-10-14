import { applyChoice, readChoice, type ThemeChoice } from '../lib/theme';

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
  }),
);
