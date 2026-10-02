# 009 — Know what works

**As** Jesus, the owner of the site
**I want** to know whether people reach the site, where they come from, what they read and
whether they take a contact action
**So that** I can tell which applications and channels work, and improve the site on evidence
rather than guesses

## Evidence (2026-10-02)

The site has been public since 2026-09-30 and there is no way to know whether anyone has
visited it. GitHub Pages offers no visitor statistics. Story 003 already emits three named
conversion events (`cv_download`, `email_copy`, `email_open`) through `track()`, but
`track()` does nothing yet: Phase 1 decided to connect it to PostHog EU in cookieless mode in
this phase (analysis decision 4).

The site makes no third-party request today, and the Lighthouse budget enforces it: zero
third-party requests and at most 15 KB of script per page. Measuring visits must not cost
that speed, or the site stops proving the quality it claims.

## Acceptance criteria

- WHEN a visitor opens any page
  THEN a page view is recorded with the path, the locale, the referring domain and any
  `utm_*` parameters of the link
- WHEN a visitor downloads the CV, copies the email address or opens the email link
  THEN that event is recorded with the page and the locale it happened on
- WHEN a visitor scrolls to the result section of a case study
  THEN a `case_result_seen` event is recorded with the case, so a read to the end can be told
  apart from a glance
- WHEN Jesus shares a link tagged with `utm_source` (for example `linkedin` or the name of a
  company he applied to)
  THEN the visits from that link can be told apart from the rest
- WHEN any of this is recorded
  THEN nothing is stored on the visitor's device (no cookie, no `localStorage`, no
  identifier that survives the visit), and the data is processed in the EU
- WHEN the browser sends Global Privacy Control or Do Not Track
  THEN nothing is recorded for that visitor
- WHEN Jesus visits his own site from a browser he has marked as his
  THEN his visits are not counted. The mark is the one thing stored on a device, and only on
  the browsers where Jesus sets it himself; a visitor's browser never gets it
- WHEN the analytics service is blocked, slow or down
  THEN the page behaves exactly the same and shows no error
- WHEN Jesus opens the dashboard
  THEN he sees, per week: visits, top referrers and campaigns, top pages, case reads to the
  end, and each conversion event, split by locale

## Definition of done

- A short privacy note, in English and Spanish, says what is collected and what is not, and
  is reachable from every page. Its frame in Penpot and its copy are approved before code
- The Lighthouse budget still passes on every page. Any change to it (for example, allowing
  the analytics endpoint as the one third-party request) is stated in the analysis and
  approved by Jesus, never loosened silently
- A test asserts the payload each event sends, and that nothing is sent under Global Privacy
  Control or Do Not Track
- Events from the published site are seen arriving in the dashboard, for a page view and for
  each conversion event
- No cookie and no new storage key appear in a visitor's browser after visiting every page

**✅ Approved on 2026-10-02:** the story as written, with its three product decisions: a
`case_result_seen` event for case reads to the end, excluding Jesus's own visits with a mark
set only on his browsers, and a privacy note page linked from every page's footer.
