export interface NumericParts {
  prefix: string;
  number: number;
  decimals: number;
  suffix: string;
}

const DURATION_MS = 900;

export function splitNumeric(value: string): NumericParts | null {
  const match = /^(\D*?)(\d+(?:\.\d+)?)(.*)$/s.exec(value);
  if (!match) return null;
  const [, prefix, digits, suffix] = match;
  return { prefix, number: Number(digits), decimals: digits.split('.')[1]?.length ?? 0, suffix };
}

export function countUp(element: HTMLElement, value: string, locale: string): void {
  const parts = splitNumeric(value);
  if (!parts || parts.number === 0) return;
  if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return;

  const format = new Intl.NumberFormat(locale, {
    minimumFractionDigits: parts.decimals,
    maximumFractionDigits: parts.decimals,
    useGrouping: false,
  });
  const render = (current: number) => {
    element.textContent = `${parts.prefix}${format.format(current)}${parts.suffix}`;
  };

  const start = performance.now();
  const step = (now: number) => {
    const progress = Math.min((now - start) / DURATION_MS, 1);
    render(parts.number * easeOutCubic(progress));
    if (progress < 1) requestAnimationFrame(step);
  };
  render(0);
  requestAnimationFrame(step);
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}
