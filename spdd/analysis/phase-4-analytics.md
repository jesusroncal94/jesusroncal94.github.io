# Analysis — Phase 4: Know what works

Step 3 of the SPDD flow for story [009](../stories/009-know-what-works.md). Inputs: the story
and the six frames on the Privacy page of the Penpot file, both approved on 2026-10-02; the
site as of commit `9f2d8c4`; and PostHog's documentation and source as read on 2026-10-02.

## 1. Diagnosis

### What the site already gives

| Piece | State |
| --- | --- |
| Conversion events | `track()` in `src/lib/track.ts`, called by `src/scripts/contact.ts` from `data-track` attributes. It does nothing yet |
| Named events | `cv_download`, `email_copy`, `email_open`, and a fourth one the story did not list: `profile_open`, on the LinkedIn and GitHub links |
| Locale | Every page knows its locale from the route |
| Case anchors | Each case has `#problem`, `#approach` and `#result` in both locales (story 004a), so "read to the result" has a stable target |
| Script weight | About 0.3 KB of external script (gzip) and 3 KB of inline script on the heaviest page, against a 15 KB budget |
| Content-Security-Policy | None, so nothing blocks a request to another origin |

### What it lacks

| Gap | Why it matters here |
| --- | --- |
| No page views | The story's first question, whether anyone visits, cannot be answered |
| No `case_result_seen` | Reading to the end cannot be told from a glance |
| No GPC/DNT check, no owner mark | Required by the story |
| No privacy note and no site footer on case pages | The approved frames add both |
| The Lighthouse budget allows zero third-party requests | Any hosted analytics breaks it as written; see decision 2 |

### What was verified about PostHog (2026-10-02)

| Claim in the approved copy | Verdict | Source |
| --- | --- | --- |
| "Processed in the EU" | **Holds.** PostHog Cloud EU runs in AWS `eu-central-1`, Frankfurt, as an independent instance; the endpoint is `eu.i.posthog.com` | [Introducing PostHog Cloud EU](https://posthog.com/blog/posthog-cloud-eu), [Controlling data storage](https://posthog.com/docs/privacy/data-storage) |
| "Your IP address is used to count the visit and then discarded" | **Holds.** In cookieless server hash mode the visitor id is `hash(team, daily salt, IP, user agent, host)`; the salt is deleted once the day's events are processed, and the IP is stripped before anything else runs on the event | [Cookieless tracking](https://posthog.com/tutorials/cookieless-tracking), [Controlling data storage](https://posthog.com/docs/privacy/data-storage) |
| "It is kept for one year" | **Does not hold as written.** On the free plan, events older than a year drop out of every query, but the docs do not say they are deleted, and a project cannot shorten its retention | [Events data retention](https://posthog.com/docs/data/events-retention) |

Two costs of cookieless mode, accepted here: there is no country (GeoIP needs the IP, which is
stripped first) and no bot detection. A visitor who changes network mid-visit counts as two.

## 2. Direction

### Decision 1 — Provider and mode

PostHog Cloud EU in **cookieless server hash mode** (`Project settings > Web analytics >
Cookieless server hash mode`), as Phase 1 decided. The free plan covers a million events a
month, far above a portfolio's traffic.

### Decision 2 — No SDK: a first-party tracker of about 1 KB

The official `posthog-js` SDK is tens of kilobytes and loads from `eu-assets.i.posthog.com`,
which would break both budget lines on its own. In cookieless mode the SDK sends very little,
and its own tests show exactly what:

- `distinct_id: "$posthog_cookieless"`, `$cookieless_mode: true`, `$device_id: null`, and no
  session or window id. The server derives the visitor and the session from the hash.

So `src/lib/track.ts` sends that shape itself, with `fetch(..., { keepalive: true })` to
`https://eu.i.posthog.com/i/v0/e/`. Each event carries `$current_url`, `$pathname`, `$host`,
`$referrer`, `$referring_domain`, the `utm_*` parameters, `locale`, and
`$process_person_profile: false`, so no person profile is ever created. The project key is a
public, write-only key by design, but it is not written in the repository: it comes from a
build variable (amended 2026-10-02, see the incident in canvas 009).

**The budget change this needs, for Jesus to approve:**

- `resource-summary:third-party:count` goes from **0 to 1**, and that one request must be
  `eu.i.posthog.com`.
- A unit test asserts the tracker posts only to that host, so no second third party can slip
  in.
- Script size stays at 15 KB with no change.
- The alternative of keeping it at 0 needs a first-party proxy. GitHub Pages cannot run one,
  so it would mean another hosted service. That is more moving parts for a portfolio, and it
  is not recommended.

### Decision 3 — What is sent, and when

| Event | When | Extra properties |
| --- | --- | --- |
| `$pageview` | On load, once | — |
| `cv_download`, `email_copy`, `email_open` | On the existing `data-track` elements | `page`, `locale` |
| `profile_open` | Same, already in the markup | `target` (`linkedin` or `github`) |
| `case_result_seen` | First time `#result` enters the viewport, one per page view | `case` (the slug) |

Nothing is sent when:
- `navigator.globalPrivacyControl === true`;
- `navigator.doNotTrack === '1'`;
- the owner mark is set;
- the host is not `jesusroncal94.github.io`, so local builds, previews and CI send nothing.

A failed or blocked request is swallowed silently, and nothing waits on it.

### Decision 4 — The owner mark

- Visiting any page with `?analytics=off` stores `analytics=off` in that browser's
  `localStorage`, and `?analytics=on` removes it.
- Nothing on the page links to it, and a visitor never gets it unless they type it.
- This is the one storage exception the story allows. The story requires no cookie and no new
  storage for visitors, and a visitor's browser gets neither.

### Decision 5 — The privacy note and the footer

- The note gets routes `/privacy/` and `/es/privacy/`, built from a content entry per locale
  with the approved copy.
- A `SiteFooter` component carries the approved line, "© 2026 Jesús Roncal · Privacy" plus the
  colophon:
  - on case pages and on the note itself, as a new footer;
  - on the home page, the Privacy link is added to the existing Contact footer;
  - on phones it gets the bottom space that keeps the contact bar from covering it.
- The CV page keeps no footer, because it is printed to PDF.
- The two new routes join `lighthouserc.json`, and the coverage test grows from 12 to 14 URLs.

### Decision 6 — The retention sentence (copy back for approval)

The approved sentence "and it is kept for one year" claims a deletion the docs do not promise.

| | Proposed replacement |
| --- | --- |
| EN | To PostHog, processed in the EU. I use it to see which applications and pages work, never to profile anyone. My reports cover the last twelve months. |
| ES | A PostHog, que lo procesa en la UE. Lo uso para ver qué candidaturas y qué páginas funcionan, nunca para perfilar a nadie. Mis informes abarcan los últimos doce meses. |

### Decision 7 — The dashboard

PostHog's built-in **Web analytics** dashboard gives visits, referrers, UTM campaigns and top
pages with no setup. On top of it, one insight lists each conversion event and
`case_result_seen` per week, broken down by `locale`. Jesus creates the PostHog account and the
EU project himself, because creating accounts is his to do. He then turns on cookieless
server hash mode and passes on the project key.

## 3. Risks

| Risk | Mitigation |
| --- | --- |
| PostHog changes the cookieless capture contract | The shape is copied from the SDK's own tests; the end-to-end check in the definition of done catches a silent drop, and the tracker is one small file to adapt |
| Ad blockers block `eu.i.posthog.com` | Accepted: counts are a lower bound, and the page is unaffected |
| Bots inflate visits (no bot detection in cookieless mode) | Accepted for now; most crawlers do not run scripts. Revisit if numbers look implausible |
| Lighthouse in CI never sees the request, because of the host gate | Stated rather than hidden: the budget allows exactly one third party, and a unit test pins it to PostHog. A one-off Lighthouse run on the published site after launch confirms the real page |
| A visitor's IP reaches PostHog at all | Inherent to any hosted measurement; it is used only for the daily hash and stripped first, as the note says |

## 4. Decisions

**✅ Decision 1 — Provider and mode.** Confirmed 2026-10-02: PostHog Cloud EU, cookieless server hash mode.

**✅ Decision 2 — Tracker and budget.** Confirmed 2026-10-02: A first-party tracker of about 1 KB, no SDK, with the
third-party budget from 0 to 1, pinned to `eu.i.posthog.com`.

**✅ Decision 3 — Events.** Confirmed 2026-10-02: As in the table, including `profile_open` and the gates.

**✅ Decision 4 — Owner mark.** Confirmed 2026-10-02: `?analytics=off` and `?analytics=on`, stored only in
`localStorage` of the browsers where Jesus sets it.

**✅ Decision 5 — Note and footer.** Confirmed 2026-10-02: As described, with 14 audited URLs.

**✅ Decision 6 — Retention sentence.** Confirmed 2026-10-02: The replacement copy above, in both languages.

**✅ Decision 7 — Dashboard.** Confirmed 2026-10-02: The built-in Web analytics dashboard plus one conversions
insight. Jesus creates the account and the project.

## 5. Follow-up — what the insights count (2026-10-05)

Found on 2026-10-05 while checking, through the PostHog connector, whether the three
conversion events still missing from the launch Sync had arrived.

### Diagnosis

- **The three events have not arrived, because nobody has used them yet.** Since launch the
  project holds 2 real `$pageview` events and no real conversion. Test traffic, tagged
  `utm_source` `verification` or `lighthouse`, holds 9 `$pageview`, 3 `case_result_seen` and
  1 `profile_open`.
- **The insights count test traffic.** Neither "CV downloads per day" (`mcyB7nqs`) nor
  "Conversions per week, by language" (`htd4kN4i`) filters it, so the second already shows the
  test `profile_open` and `case_result_seen` beside the real ones. A verification run that
  fires `cv_download` would also trigger the alert "Someone downloaded the CV", which reads the
  first.
- **One real page view was dropped after the user-agent fix.** `system.ingestion_warnings`
  holds three `cookieless_missing_user_agent` warnings for `$pageview`: two at 09:09 and
  09:18 UTC on 2026-10-03, before `c7b65ed` was deployed at 09:36, and one at 20:32 UTC. The
  published tracker always sends `navigator.userAgent`, so that browser most likely reported an
  empty one (a privacy extension, or a bot that runs scripts). PostHog keeps nothing else of a
  dropped event, so the cause cannot be confirmed.

### Direction

1. **Exclude test traffic from both insights:** an event filter `utm_source` is not
   `verification` and not `lighthouse`. The tags come from the page URL, so every event fired
   on a tagged page carries them, and untagged events keep passing the filter.
2. **A tagged verification visit to the published site** that downloads the CV, copies the
   email and opens the email link, to close the launch Sync's last open item. Only after 1, so
   it cannot trigger the alert.
3. **The dropped page view is recorded and watched, with no code change.** One event with no
   confirmed cause does not justify changing the tracker. If it recurs, the option is a fixed
   placeholder when the user agent is empty, which changes what the privacy note says and so
   goes back for copy approval.

**✅ Decision 8 — Test traffic in the insights.** Confirmed 2026-10-05: direction 1, the filter
on both insights.

**⚠️ Pending — 9, the verification visit.** Direction 2, after decision 8 is applied.

**⚠️ Pending — 10, the dropped page view.** Direction 3, recorded in canvas 009 and watched.
