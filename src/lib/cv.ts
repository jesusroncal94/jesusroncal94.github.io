import type { Locale } from '../i18n/locales';

export const cvFileName = (locale: Locale) => `jesus-roncal-cv-${locale}.pdf`;

export const cvPath = (locale: Locale) => `/cv/${cvFileName(locale)}`;

// The CV a recruiter receives fits on two pages; the build refuses a longer one.
export const MAX_CV_PAGES = 2;

// Counts the page objects of a PDF (not the /Pages tree nodes).
export const pdfPageCount = (pdf: Uint8Array) => (new TextDecoder('latin1').decode(pdf).match(/\/Type\s*\/Page(?![a-zA-Z])/g) ?? []).length;
