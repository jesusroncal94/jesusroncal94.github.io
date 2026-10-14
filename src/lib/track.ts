import type { Locale } from '../i18n/locales';
import { ANALYTICS } from './analytics-config';

export type ConversionEvent = 'cv_download' | 'email_copy' | 'email_open' | 'profile_open';
// Actions the page reports through the CONVERSION channel; the theme switch is one, not a conversion.
export type TrackedAction = ConversionEvent | 'theme_change';
export type AnalyticsEvent = '$pageview' | TrackedAction | 'case_result_seen';

export const CONVERSION = 'conversion';

export interface Conversion {
  event: TrackedAction;
  props?: Record<string, string>;
}

export interface Visit {
  host: string;
  href: string;
  pathname: string;
  referrer: string;
  userAgent: string;
  locale: Locale;
  theme: 'light' | 'dark';
  themeSource: ThemeSource;
  globalPrivacyControl: boolean;
  doNotTrack: boolean;
  ownerMarked: boolean;
}

export type ThemeSource = 'choice' | 'system' | 'page';

// The theme as CSS resolved it, and who decided it: data-theme marks a visitor's choice, unless the page
// pins its theme (data-theme-pinned). Read from the page, not lib/theme: importing it would split the
// switch's code into a shared chunk, one more request before LCP.
export function themeOf(colorScheme: string, pinned: boolean, chosen: boolean) {
  const theme: 'light' | 'dark' = colorScheme === 'light' ? 'light' : 'dark';
  const themeSource: ThemeSource = pinned ? 'page' : chosen ? 'choice' : 'system';
  return { theme, themeSource };
}

export const OWNER_MARK = { key: 'analytics', value: 'off' } as const;

const COOKIELESS_ID = '$posthog_cookieless';
const DIRECT = '$direct';

export function isMeasured(visit: Visit, key: string): boolean {
  return (
    key !== '' &&
    visit.host === ANALYTICS.host &&
    !visit.globalPrivacyControl &&
    !visit.doNotTrack &&
    !visit.ownerMarked
  );
}

export function buildEvent(event: AnalyticsEvent, visit: Visit, key: string, props: Record<string, string> = {}) {
  return {
    api_key: key,
    event,
    distinct_id: COOKIELESS_ID,
    properties: {
      $cookieless_mode: true,
      $process_person_profile: false,
      $device_id: null,
      $current_url: visit.href,
      $pathname: visit.pathname,
      $host: visit.host,
      $raw_user_agent: visit.userAgent,
      $referrer: visit.referrer || DIRECT,
      $referring_domain: visit.referrer ? new URL(visit.referrer).host : DIRECT,
      locale: visit.locale,
      theme: visit.theme,
      theme_source: visit.themeSource,
      ...campaignTags(visit.href),
      ...props,
    },
  };
}

function campaignTags(href: string): Record<string, string> {
  return Object.fromEntries([...new URL(href).searchParams].filter(([name]) => name.startsWith('utm_')));
}

export function readVisit(): Visit {
  const root = document.documentElement;
  const { theme, themeSource } = themeOf(
    getComputedStyle(root).colorScheme,
    root.hasAttribute('data-theme-pinned'),
    root.hasAttribute('data-theme'),
  );
  return {
    host: location.host,
    href: location.href,
    pathname: location.pathname,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    locale: root.lang as Locale,
    theme,
    themeSource,
    globalPrivacyControl: (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true,
    doNotTrack: navigator.doNotTrack === '1',
    ownerMarked: readOwnerMark() === OWNER_MARK.value,
  };
}

function readOwnerMark(): string | null {
  try {
    return localStorage.getItem(OWNER_MARK.key);
  } catch {
    return null;
  }
}

export function track(event: AnalyticsEvent, props?: Record<string, string>): void {
  const visit = readVisit();
  if (!isMeasured(visit, ANALYTICS.key)) return;
  fetch(ANALYTICS.endpoint, {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(buildEvent(event, visit, ANALYTICS.key, props)),
  }).catch(() => {});
}
