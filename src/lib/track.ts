import type { Locale } from '../i18n/locales';
import { ANALYTICS } from './analytics-config';

export type ConversionEvent = 'cv_download' | 'email_copy' | 'email_open' | 'profile_open';
export type AnalyticsEvent = '$pageview' | ConversionEvent | 'case_result_seen';

export const CONVERSION = 'conversion';

export interface Conversion {
  event: ConversionEvent;
  props?: Record<string, string>;
}

export interface Visit {
  host: string;
  href: string;
  pathname: string;
  referrer: string;
  locale: Locale;
  globalPrivacyControl: boolean;
  doNotTrack: boolean;
  ownerMarked: boolean;
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
      $referrer: visit.referrer || DIRECT,
      $referring_domain: visit.referrer ? new URL(visit.referrer).host : DIRECT,
      locale: visit.locale,
      ...campaignTags(visit.href),
      ...props,
    },
  };
}

function campaignTags(href: string): Record<string, string> {
  return Object.fromEntries([...new URL(href).searchParams].filter(([name]) => name.startsWith('utm_')));
}

export function readVisit(): Visit {
  return {
    host: location.host,
    href: location.href,
    pathname: location.pathname,
    referrer: document.referrer,
    locale: document.documentElement.lang as Locale,
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
