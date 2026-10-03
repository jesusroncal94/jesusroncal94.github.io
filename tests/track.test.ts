import { describe, expect, it } from 'vitest';
import { ANALYTICS } from '../src/lib/analytics-config';
import { buildEvent, isMeasured, type Visit } from '../src/lib/track';

const KEY = 'phc_test';

const visit: Visit = {
  host: 'jesusroncal94.github.io',
  href: 'https://jesusroncal94.github.io/es/work/02-cost-leak/?utm_source=linkedin&utm_campaign=acme&ref=x',
  pathname: '/es/work/02-cost-leak/',
  referrer: 'https://www.linkedin.com/feed/',
  userAgent: 'Mozilla/5.0 (test)',
  locale: 'es',
  globalPrivacyControl: false,
  doNotTrack: false,
  ownerMarked: false,
};

describe('buildEvent', () => {
  it('sends a page view in the cookieless shape', () => {
    expect(buildEvent('$pageview', visit, KEY)).toEqual({
      api_key: KEY,
      event: '$pageview',
      distinct_id: '$posthog_cookieless',
      properties: {
        $cookieless_mode: true,
        $process_person_profile: false,
        $device_id: null,
        $current_url: visit.href,
        $pathname: '/es/work/02-cost-leak/',
        $host: 'jesusroncal94.github.io',
        $raw_user_agent: 'Mozilla/5.0 (test)',
        $referrer: 'https://www.linkedin.com/feed/',
        $referring_domain: 'www.linkedin.com',
        locale: 'es',
        utm_source: 'linkedin',
        utm_campaign: 'acme',
      },
    });
  });

  it('adds the properties of a conversion', () => {
    expect(buildEvent('profile_open', visit, KEY, { target: 'github' }).properties).toMatchObject({
      target: 'github',
      locale: 'es',
    });
  });

  it('marks a visit without a referrer as direct', () => {
    expect(buildEvent('$pageview', { ...visit, referrer: '' }, KEY).properties).toMatchObject({
      $referrer: '$direct',
      $referring_domain: '$direct',
    });
  });
});

describe('isMeasured', () => {
  it('measures a visit on the published site', () => {
    expect(isMeasured(visit, KEY)).toBe(true);
  });

  it.each([
    ['there is no project key', visit, ''],
    ['the host is not the published site', { ...visit, host: 'localhost:4321' }, KEY],
    ['Global Privacy Control is on', { ...visit, globalPrivacyControl: true }, KEY],
    ['Do Not Track is on', { ...visit, doNotTrack: true }, KEY],
    ['the browser carries the owner mark', { ...visit, ownerMarked: true }, KEY],
  ])('sends nothing when %s', (_, gated, key) => {
    expect(isMeasured(gated, key)).toBe(false);
  });
});

it('sends events only to PostHog EU', () => {
  expect(new URL(ANALYTICS.endpoint).host).toBe('eu.i.posthog.com');
});
