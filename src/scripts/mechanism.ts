import { interpolate } from '../i18n/translate';
import { stepAfter } from '../lib/mechanism';

// The same condition as the `stepped` variant: elsewhere the static version stays.
const STEPPED = '(scripting: enabled) and (prefers-reduced-motion: no-preference)';

function enhance(figure: HTMLElement) {
  const stages = [...figure.querySelectorAll<HTMLElement>('[data-stage]')];
  const dots = [...figure.querySelectorAll<HTMLElement>('[data-dot]')];
  const sentences = [...figure.querySelectorAll<HTMLElement>('[data-sentences] > li > :last-child')].map((s) => s.textContent ?? '');
  const previous = figure.querySelector<HTMLButtonElement>('[data-previous]')!;
  const next = figure.querySelector<HTMLButtonElement>('[data-next]')!;
  const counter = figure.querySelector<HTMLElement>('[data-counter]')!;
  const sentence = figure.querySelector<HTMLElement>('[data-sentence]')!;
  const live = figure.querySelector<HTMLElement>('[data-live]')!;
  const template = figure.dataset.stepTemplate!;
  const total = stages.length;
  let current = 0;

  const apply = (announce: boolean) => {
    figure.dataset.step = String(current);
    stages.forEach((stage, index) => {
      stage.toggleAttribute('data-current', index === current);
      if (index === current) stage.setAttribute('aria-current', 'step');
      else stage.removeAttribute('aria-current');
    });
    dots.forEach((dot, index) => dot.toggleAttribute('data-current', index === current));
    // A button disabled while focused would drop focus to the page; hand it to the other one.
    const focused = document.activeElement;
    previous.disabled = current === 0;
    next.disabled = current === total - 1;
    if (focused === next && next.disabled) previous.focus();
    if (focused === previous && previous.disabled) next.focus();
    const step = interpolate(template, { n: String(current + 1), total: String(total) });
    counter.textContent = step;
    sentence.textContent = sentences[current];
    if (announce) live.textContent = `${step}. ${sentences[current]}`;
  };

  const move = (delta: -1 | 1) => {
    const target = stepAfter(current, delta, total);
    if (target === current) return;
    current = target;
    apply(true);
  };

  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  figure.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    move(event.key === 'ArrowLeft' ? -1 : 1);
  });
  apply(false);
}

if (matchMedia(STEPPED).matches) document.querySelectorAll<HTMLElement>('[data-mechanism]').forEach(enhance);
