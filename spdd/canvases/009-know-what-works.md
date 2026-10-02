# 009 — Know what works

Story: [009](../stories/009-know-what-works.md). Analysis:
[Phase 4](../analysis/phase-4-analytics.md). Penpot, page Privacy: `Privacy — Desktop 1440`,
`Privacy — Phone 390`, `Home footer — Desktop 1440`, `Home footer — Phone 390`,
`Case end — Desktop 1440`, `Case end — Phone 390` (see [../design.md](../design.md)).

**Status:** ⚠️ awaiting approval to start. The privacy note copy (EN and ES) and the footer link
were approved on 2026-10-02 with the frames. The retention sentence was replaced and approved
on 2026-10-02 (analysis decision 6).

## R — Requirements

The site measures visits and contact actions without storing anything on a visitor's device,
and says so on a privacy note linked from every page.

- A page view is sent on every page, and a named event on each contact action and on reading a
  case to its result. Each carries the path, the locale, the referrer and the `utm_*` tags.
- Nothing is sent under Global Privacy Control or Do Not Track, from a browser carrying the
  owner mark, or from any host other than `jesusroncal94.github.io`.
- The tracker is first party and talks only to `eu.i.posthog.com`, in PostHog's cookieless
  shape. A failed request changes nothing on the page.
- `/privacy/` and `/es/privacy/` hold the approved note. A footer with
  "© 2026 Jesús Roncal · Privacy" ends every page except the CV.

**Done when:**
- The unit tests pass, including:
  - the payload of each event;
  - the gates (GPC, DNT, the owner mark, a foreign host, a missing key);
  - the pinned host.
- `/privacy/` and `/es/privacy/` match their frames. The footer matches the home and case
  frames on desktop and phone, and the contact bar does not cover it on phones.
- After visiting every page in a fresh browser profile, there is no cookie and no new storage
  key.
- The link check, the preview check, the Spanish review test and the overflow audit pass, and
  Lighthouse passes on 14 URLs with the third-party budget at 1.
- After the deploy, with the project key in place, a page view and each conversion event are
  seen arriving in the PostHog EU project. A one-off Lighthouse run on the published home page
  passes.

## E — Entities

```ts
type AnalyticsEvent = '$pageview' | ConversionEvent | 'case_result_seen'
type ConversionEvent = 'cv_download' | 'email_copy' | 'email_open' | 'profile_open'   // exists

interface Visit {                 // read from the browser, injected so it can be tested
  host: string; href: string; pathname: string; referrer: string;
  locale: Locale; globalPrivacyControl: boolean; doNotTrack: boolean; ownerMarked: boolean;
}

ANALYTICS = { endpoint: 'https://eu.i.posthog.com/i/v0/e/', key: string, host: 'jesusroncal94.github.io' }

isMeasured(visit: Visit, key: string): boolean
buildEvent(event: AnalyticsEvent, visit: Visit, key: string, props?: Record<string, string>): CaptureBody
CaptureBody {
  api_key: string; event: AnalyticsEvent; distinct_id: '$posthog_cookieless';
  properties: { $cookieless_mode: true; $process_person_profile: false; $device_id: null;
    $current_url; $pathname; $host; $referrer; $referring_domain; locale; utm_*?; ...props }
}
```

## A — Approach

The analysis decisions 1–7. `track()` stops being a stub. It builds the same body PostHog's own
SDK sends in cookieless mode, and posts it with `fetch(…, { keepalive: true })`, so the visitor
id and the session are derived on PostHog's servers and nothing is stored here. The decisions
are pure functions (`isMeasured`, `buildEvent`) fed with a `Visit` read from the browser in one
place, so they are tested without a DOM. One small script in `Base` sends the page view, handles
the owner mark and watches `#result` on case pages. The existing `contact.ts` keeps routing
`data-track` clicks, now through the real `track()`.

The note is content, one entry per locale in the site YAML, rendered by an ordinary page. The
footer is one component, used by case pages and the note. The home page adds the link to its
existing Contact footer instead, as its frame shows.

## S — Structure

```
spdd/canvases/norms.md               third-party exception for Phase 4, with its date
spdd/analysis/phase-4-analytics.md   decisions recorded as ✅ Confirmed 2026-10-02
src/lib/analytics-config.ts          ANALYTICS (endpoint, public key, production host)
src/lib/track.ts                     AnalyticsEvent, Visit, isMeasured, buildEvent, track
src/scripts/analytics.ts             readVisit, owner mark, $pageview, case_result_seen
src/layouts/Base.astro               imports analytics.ts
src/scripts/contact.ts               passes data-track-target as `target`
src/sections/Contact.astro           Privacy link next to the copyright; data-track-target on profiles
src/components/SiteFooter.astro      © line · Privacy, and the colophon
src/pages/[...locale]/privacy.astro  the note
src/pages/[...locale]/work/[slug].astro  data-case on the article, SiteFooter after main
src/content.config.ts                + privacy block in the site schema
src/content/site/en.yaml, es.yaml    + privacy copy
src/i18n/ui/en.ts, es.ts             + footer.privacy, privacy.back
spdd/reviews/004a-es.md              + rows for the new Spanish strings
lighthouserc.json                    + 2 URLs; third-party count 0 → 1
tests/lighthouse-urls.test.ts        + the privacy pages
tests/track.test.ts                  payload, gates, pinned host
```

## O — Operations

1. **Record the approvals.**
   - In the analysis, each `⚠️ Pending` becomes `**✅ Decision N — <topic>.** Confirmed
     2026-10-02: …`.
   - In `norms.md`, the third-party safeguard becomes: "No third-party requests at runtime,
     except one: since Phase 4 (2026-10-02), the analytics event to `eu.i.posthog.com`, and
     nothing else. No CDN fonts, no embeds, no third-party scripts."
2. **`analytics-config.ts`.** The endpoint, the production host, and the project key. The key is
   empty until Jesus provides it, and an empty key means nothing is sent.
3. **`track.ts`.**
   - `isMeasured` is false when:
     - the key is empty;
     - the host is not the production host;
     - GPC is on, or DNT is on;
     - the owner mark is set.
   - `buildEvent` fills the body in the entity above. It reads the `utm_*` parameters from
     `href`, and takes `$referring_domain` from the referrer's host, or `$direct` when there is
     none.
   - `track` reads the visit, checks `isMeasured`, and posts JSON to `ANALYTICS.endpoint` with
     `keepalive`. It ignores the response and catches every error.
4. **`tests/track.test.ts`.**
   - The page view body matches the cookieless shape exactly.
   - A conversion carries its `props`, and the `utm_*` tags are copied.
   - Each gate alone stops the event.
   - `ANALYTICS.endpoint` has the host `eu.i.posthog.com`.
5. **`scripts/analytics.ts`, imported by `Base`.**
   - `readVisit()` reads from `location`, `document.referrer`, `<html lang>`,
     `navigator.globalPrivacyControl`, `navigator.doNotTrack` and
     `localStorage['analytics']`, inside `try`.
   - `?analytics=off` sets `localStorage['analytics'] = 'off'`, and `?analytics=on` removes it.
     Both are applied before anything is sent.
   - It sends `$pageview` once on load.
   - On a page whose article has `data-case`, an `IntersectionObserver` sends
     `case_result_seen` with `case` the first time `#result` is visible, then disconnects.
6. **`contact.ts` and `Contact.astro`.** The profile links get `data-track-target="linkedin"`
   and `"github"`, and `contact.ts` passes it as `target`. The other events need no new
   attribute.
7. **Copy.**
   - `footer.privacy`: "Privacy" / "Privacidad".
   - `privacy.back`: "Home" / "Inicio".
   - The site schema gains `privacy: { eyebrow, title, updated, sections: [{ heading, text }] }`.
   - `en.yaml` and `es.yaml` get the approved note, with the replaced retention sentence.
   - The new Spanish strings are added to `spdd/reviews/004a-es.md` as `ok` rows dated
     2026-10-02, so the review test keeps covering every key.
8. **`SiteFooter.astro`** (frames `Case end`).
   - The top rule, then `code-mono`: "© 2026 {displayName}" · a link to `privacy` in `muted`,
     with the colophon and source link at the right.
   - It stacks on phones, with `pb` large enough for the fixed contact bar (120 px, as the
     frame shows) on pages that have one.
9. **Pages.**
   - `[...locale]/privacy.astro` follows the case layout: back link, eyebrow, `heading-h2`
     title, `updated` in `code-mono`, then each section as `heading-h3` and `body-l` muted.
     It passes the home `PreviewImage`, so the preview check holds, and ends with
     `SiteFooter`.
   - `work/[slug].astro` adds `data-case={slug}` to the article and `SiteFooter` after `main`.
   - `Contact.astro` adds "· Privacy" after its copyright (frames `Home footer`).
   - The CV page is unchanged.
10. **Lighthouse.** Two URLs are added, and `resource-summary:third-party:count` goes from 0
    to 1. The coverage test adds `privacy` for every published locale.
11. **Check.**
    - Tests, the build checks, the overflow audit (`/`, one case and `/privacy/`) and
      Lighthouse on 14 URLs.
    - Compare screenshots with the six frames.
    - A fresh-profile storage check: no cookie and no new key.
    - Locally, with the host gate forced on for the test only, confirm the request body
      PostHog would receive.
12. **Launch, Jesus's part, then the end-to-end check.**
    - Jesus creates the PostHog account and an EU project, enables "Cookieless server hash
      mode", and passes on the project key.
    - The key goes into `analytics-config.ts`, followed by a push with his yes.
    - Then: events seen arriving, the Web analytics dashboard, one conversions insight by
      locale, and a Lighthouse run on the published home page.

## N — Norms

All of [norms.md](norms.md), with the Phase 4 amendment from operation 1. In particular:
- "Every visible string comes from content or the i18n dictionary": the note and the footer
  link.
- "Works without JavaScript": without scripts nothing is measured, and every page still works.
- "Tests cover the happy path", plus the privacy gates in operation 4, which are this story's
  privacy guard.

## S — Safeguards

- The note states only what the code does. If the code changes what is sent, the note changes
  in the same commit.
- No cookie and no storage on a visitor's device. The only key is the owner mark, set by hand.
- No identifier is sent: no `distinct_id` other than the cookieless placeholder, no session
  id, no person profile.
- The one third-party request goes to the EU endpoint only, and a test pins it.
- The project key is public and write-only by design. No other credential enters the
  repository.
