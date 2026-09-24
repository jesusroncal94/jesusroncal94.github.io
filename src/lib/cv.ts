import type { Locale } from '../i18n/locales';

export const cvFileName = (locale: Locale) => `jesus-roncal-cv-${locale}.pdf`;

export const cvPath = (locale: Locale) => `/cv/${cvFileName(locale)}`;
