# 004 — Read it in my language

**As a** recruiter or hiring manager in Spain, Italy or Latin America
**I want** the site, the case studies and the CV in my language, with local formats
**So that** it reads as written for me, and I can forward it to colleagues as it is

## Scope

Revised on 2026-09-30, before the mockups. The site now has more than it did when this
story was first written, and every piece of it has to be localised:
- the home page, four case studies, the command palette and the UI strings, about 2,700
  words;
- the CV page and its PDF;
- the link preview cards from story 008.

Spanish and Italian ship separately, because they are reviewed differently:
- **004a, Spanish.** Jesus is a native speaker and reviews it himself.
- **004b, Italian.** Jesus is at A2, so a native speaker reviews it before it is published.
  Until then, `it` is built but left out of `PUBLISHED_LOCALES`.

## Acceptance criteria

- WHEN the browser language is `es` or `it`, that locale is published, and the visitor
  lands on an English page
  THEN a dismissible suggestion to switch language appears, and never an automatic
  redirect. Dismissing it is remembered on that device.
- WHEN the visitor uses the language switcher in the nav
  THEN they land on the same page and section in the other locale
- WHEN JavaScript is disabled
  THEN the switcher still works as plain links, and no suggestion is shown
- WHEN numbers, currency and dates are rendered
  THEN they follow the locale: `12K` / `12 mil` / `12.000`, `$1.50` / `1,50 US$`, and
  `Sep 2024` / `sept 2024` / `set 2024`
- WHEN a case metric is a quoted figure, such as "$15/day" or "45.6%"
  THEN it is localised only where the number format differs ("45,6 %"), and its meaning
  never changes
- WHEN the Italian version is shown
  THEN it says honestly that Jesus is learning Italian (A2), as the public profile states
- WHEN a page is shared or crawled in any published locale
  THEN it has a localised title, description, link preview card and `og:locale`, plus
  `hreflang` alternates for every published locale and `x-default` pointing to English
- WHEN the visitor downloads the CV from a localised page
  THEN they get the PDF in that language

## Definition of done

- Mockups in Penpot for the language switcher and the suggestion (phone and desktop) are
  approved before code
- Jesus approves the Spanish copy before 004a ships
- A native Italian speaker reviews the Italian copy before 004b ships, and Jesus approves it
- The link, preview and overflow checks cover every published locale. The overflow audit
  runs on the longest locale, since Spanish and Italian run 15–30% longer than English
- Every fact stays traceable to `profile.md`: translation never adds, rounds or softens a
  claim
- The Lighthouse budget passes on every page of every published locale
