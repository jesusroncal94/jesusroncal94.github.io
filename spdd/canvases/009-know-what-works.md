# 009 — Know what works

Story: [009](../stories/009-know-what-works.md). Analysis:
[Phase 4](../analysis/phase-4-analytics.md). Penpot, page Privacy: `Privacy — Desktop 1440`,
`Privacy — Phone 390`, `Home footer — Desktop 1440`, `Home footer — Phone 390`,
`Case end — Desktop 1440`, `Case end — Phone 390` (see [../design.md](../design.md)).

**Status:** in progress since 2026-10-02 (start approved that day). The privacy note copy (EN and ES) and the footer link
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
src/lib/analytics-config.ts          ANALYTICS (endpoint, production host, key from PUBLIC_POSTHOG_KEY)
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
    - The key goes into the `PUBLIC_POSTHOG_KEY` repository variable, never into the code (incident below), followed by a push with his yes.
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
- No key or token is written in the repository, public or not. The project token comes from
  the `PUBLIC_POSTHOG_KEY` build variable (amended 2026-10-02, see the incident below).

## Sync — 2026-10-02 (operations 1–11)

Implemented up to operation 11. This section is authoritative where it differs from the
operations above. Operation 12 needs Jesus's PostHog project and key, and a push.

- **Op 3.**
  - `readVisit()` lives in `src/lib/track.ts`, not in `analytics.ts`: `track()` needs it when
    `contact.ts` calls it too.
  - The body is sent as `text/plain`, not `application/json`. That avoids a CORS preflight,
    which does not combine well with `keepalive`. Whether PostHog accepts it is confirmed in
    the end-to-end check of operation 12.
- **Ops 3–4** are one commit, the code with its tests. Commits for this canvas use a new
  `analytics` scope.
- **Op 7.** The note's date is data (`updated: '2026-10-02'`), formatted by a new
  `formatDate`. It uses `en-GB` for English full dates because the site writes British
  English, which gives the approved "2 October 2026"; plain `en` gives "October 2, 2026".
- **Op 8.**
  - The copyright, the separator and the Privacy link are three siblings in a flex row
    (`gap-[1ch]`), in `SiteFooter` and in the home Contact footer.
  - Inside one paragraph, the link failed Lighthouse's `link-in-text-block`, because it was
    told apart from the text by colour alone. Accessibility fell to 0.95 on case pages and
    0.91 on the note. The row looks the same as the frames.
  - Astro's HTML compression also dropped the space after the "·" when it was written as
    text.
- **Op 9.** The note's meta description reuses approved copy, the "What is not" text, so no
  unapproved string ships.

**Verified on 2026-10-02, on the production build:**
- **Tests:** 271 pass, among them:
  - 10 for the tracker: the payload, each of the five gates, and the pinned host;
  - 15 new review rows matched against the content.
- **Checks:** "Checked internal links in 14 pages: none broken" and "Checked link previews in
  14 pages: all complete".
- **Overflow audit:** zero overflow on `/`, `/work/02-cost-leak/`, `/privacy/` and
  `/es/privacy/` at all 12 widths.
- **Screenshots** at 1440 and 390 px match the six frames:
  - privacy EN and ES;
  - home footer;
  - case end, where Privacy ends 168 px above the contact bar on phones.

  The only visible difference is where the desktop note title wraps.
- **Lighthouse,** 14 URLs × 3 runs, all assertions pass:
  - accessibility 1 and performance 1 everywhere;
  - median LCP 1231–1382 ms;
  - at most 5.1 KB of script;
  - no third-party request, because the host gate keeps localhost silent.

  An earlier run had single LCP readings of 1512 and 1522 ms. The commit before this canvas
  (`5ded6f2`) measures 1380 ms on `/` and 1382 ms on `/es/` with the same method, against
  1382 and 1375 ms now, so the canvas does not change LCP.
- **Storage:** after visiting all 14 pages in a fresh profile, there are no cookies and no
  `localStorage` or `sessionStorage` key.
- **Sending path:**
  - The site was served as `jesusroncal94.github.io` through a Playwright route, with a test
    key injected into the tracker chunk in memory only. Requests to `eu.i.posthog.com` were
    intercepted and answered locally, so nothing left the machine.
  - Captured, all as `POST` `text/plain` to `/i/v0/e/` with
    `distinct_id: "$posthog_cookieless"`, `$cookieless_mode: true` and
    `$process_person_profile: false`:
    - `$pageview` with the referrer, `www.linkedin.com` as the referring domain, the `utm_*`
      tags and the locale;
    - one `case_result_seen` with `case: "02-cost-leak"`, even after scrolling to the result
      twice;
    - `$pageview` with `$direct`;
    - `profile_open` with `target` `linkedin` and `github`;
    - `email_open` and `cv_download`.
  - `email_copy` was not clicked in this run. It goes through the same `data-track` handler
    as the rest.
- **Gates on the published host:** zero requests with Global Privacy Control, with Do Not
  Track, and after `?analytics=off`.

**Found, outside this canvas:**
- On phones, the language suggestion pill of story 004a (`position: absolute`) covers the
  back link, "All work" on case pages and now "Home" on the note, until it is dismissed.
- `./tasks.ps1 test` stops under Windows PowerShell 5.1: `$ErrorActionPreference = 'Stop'`
  turns Docker's normal stderr into an error. `docker compose run --rm test` works.

## Incident — 2026-10-02

Two defects reached `main` in commit `b6bcd34`, pushed with Jesus's yes. The deploy did not
run, because the Lighthouse budget failed, so neither reached the published site.

**1. The project token was written in the repository.**
- What happened:
  - Operation 12 put the PostHog project token as a literal in `analytics-config.ts`, and it
    was pushed to the public `main`.
  - The canvas safeguard said this was acceptable, because the token is public and write-only
    by design.
  - Jesus caught it: a key belongs in the environment, not in the code.
- The token is public in kind, since it ends up in the published JavaScript of a static site
  anyway. But committing it puts it in the history, ties rotation to a commit, and mixes
  configuration with code.
- Fixed:
  - Jesus rotated the token in PostHog, so the committed one is dead.
  - `b6bcd34` is removed from `main` by a force-push, with Jesus's yes.
  - The key now comes from `import.meta.env.PUBLIC_POSTHOG_KEY`. The deploy workflow passes it
    from the `PUBLIC_POSTHOG_KEY` repository variable, and it is absent locally, so local builds
    send nothing.
  - Verified: a build without the variable ships an empty key, a build with it inlines it, and
    no `phc_` token is left in any tracked file.
- **New rule** in `norms.md`: no key or token in the repository, not even a public one.

**2. The Sync above wrongly said this canvas does not change LCP.**
- That conclusion came from a local Lighthouse comparison: 1380 → 1382 ms on `/`. In CI the
  same build measured a median LCP of about 1505 ms on almost every page, against about
  1358 ms for `5ded6f2`, and the budget is 1500 ms.
- **First diagnosis, wrong.**
  - The guess was the three extra early module requests (from 3 to 6).
  - `f439d43` moved `analytics.ts` behind the `load` event and made `contact.ts` import the
    tracker on a click.
  - CI still measured 1505–1510 ms on the same pages (run for `a8dd620`), so that was not the
    cause.
- **Cause, from the CI reports of `5ded6f2` and `a8dd620` compared page by page.**
  - Before this canvas, `contact.ts` imported a `track()` that did nothing. The bundle
    dropped the call, and Astro inlined the email button's script into the HTML.
  - Once `contact.ts` imported the real tracker, that script became an external module of
    about 1.1 KB. CI's simulated throttling charges it one more round trip before LCP.
  - The HTML and CSS sizes did not change in any meaningful way. `/cv/`, the one page
    without the email button, kept its LCP (1358 ms) even with the new analytics scripts.
- **Fixed** on the branch `fix-lcp-email-script`:
  - `contact.ts` imports nothing at run time. A click dispatches a `conversion` DOM event
    with the event name and its target, and `analytics.ts`, loaded after `load`, listens for
    it and calls `track()`.
  - The email script is inline again. The only external script the canvas adds is the
    `Base` entry, which waits for `load`.
  - A click before `load` is not counted, a cost accepted here.
  - The browser checks were rerun on that build and all events, gates, storage and
    overflow results match the Sync above. To inject the test key, the check now looks for
    it in any `_astro` chunk, because the tracker moved into the `analytics` chunk.
  - Confirmation is the CI Lighthouse run on the pull request, which builds without
    deploying, so a failure no longer lands on `main`.
- **Second step, from the pull request's CI run.**
  - The case pages, the note and the CV went back to about 1358 ms. `/` and `/es/` still
    measured 1506 ms.
  - On the home page the one remaining extra request before LCP was the external `Base`
    entry (1.1 KB) that loaded `analytics.ts` with a dynamic import. The case pages carried it
    too and passed, but the home page has more weight before LCP: two fonts, the portrait and
    an 11 KB document.
  - `Base` now imports `analytics.ts` statically. With no other importer, the tracker
    bundles into that one script, which has no imports, and Astro inlines it into the HTML.
    `analytics.ts` itself waits for `load` before it sends the page view.
  - Every page now makes exactly the external script requests it made before this canvas.
    The home HTML grows from 11.3 to 12.1 KB compressed, under the 14.6 KB first round trip.
  - The browser checks were rerun with the key injected into the HTML, and the results are
    the same.
- **New rule** in `norms.md`: a performance claim is measured where it is enforced.
