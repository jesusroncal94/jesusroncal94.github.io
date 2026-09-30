export interface NumericParts {
  prefix: string;
  number: number;
  decimals: number;
  suffix: string;
}

const DURATION_MS = 900;

const decimalSeparator = (locale: string) =>
  new Intl.NumberFormat(locale).formatToParts(1.1).find(({ type }) => type === 'decimal')?.value ?? '.';

export function splitNumeric(value: string, locale: string): NumericParts | null {
  const separator = decimalSeparator(locale);
  const match = new RegExp(`^(\\D*?)(\\d+(?:\\${separator}\\d+)?)(.*)$`, 's').exec(value);
  if (!match) return null;
  const [, prefix, digits, suffix] = match;
  const [whole, fraction = ''] = digits.split(separator);
  return { prefix, number: Number(`${whole}.${fraction || '0'}`), decimals: fraction.length, suffix };
}

export function countUp(element: HTMLElement, value: string, locale: string): void {
  const parts = splitNumeric(value, locale);
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
