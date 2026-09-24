import type { Locale } from './locales';
import { useTranslations } from './translate';

export function formatNumber(value: number, locale: Locale, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatMonth(yearMonth: string, locale: Locale): string {
  const [year, month] = yearMonth.split('-');
  if (!month) return year;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
  return new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date);
}

export function formatPeriod(start: string, end: string | null, locale: Locale): string {
  const yearOf = (value: string) => value.slice(0, 4);
  const until = end ? yearOf(end) : useTranslations(locale)('period.now');
  return `${yearOf(start)} — ${until}`;
}
