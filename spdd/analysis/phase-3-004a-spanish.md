# Analysis — Phase 3, 004a: Spanish

Step 3 of the SPDD flow for story [004](../stories/004-read-it-in-my-language.md), part a
(Spanish). Inputs: the story as approved on 2026-09-30, the frames `Home — Desktop 1440 · i18n`,
`Home — Phone 390 · i18n suggestion` and `Home — Phone 390 · i18n menu` (see
[../design.md](../design.md)), and the current i18n code.

## 1. Diagnosis

Phase 1 prepared for this, but only halfway.

| Piece | Ready | Missing |
| ----- | ----- | ------- |
| Astro i18n config | `en`, `es`, `it`; English at the root | — |
| Locale helpers | `localePath`, `stripLocale`, `ogLocale`, `PUBLISHED_LOCALES` | — |
| `Base` head | `hreflang` for every published locale, `x-default` | — |
| Content collections | `site/<locale>.yaml` and `cases/<locale>/*.md` are loaded by locale | The Spanish files |
| UI dictionary | `ui/en.ts`, typed keys | `ui/es.ts`, and a check that no key is missing |
| Formatting | `Intl` for numbers and months, keyed by locale | — |
| Pages | Every page hard-codes `DEFAULT_LOCALE` | Routes for `/es/…`: home, cases, CV, palette, preview cards |
| Count-up | Formats with the locale | Parses only a `.` decimal, so "45,6 %" would animate from "0,6 %" |
| Profile data | Roles, places, language levels and skills, in English | Spanish for the parts the CV shows as prose |
| Switcher and suggestion | — | Everything |
| Checks | Links, previews and overflow run on the English pages | Every published locale |

## 2. Direction

### Routing

| Option | How | Verdict |
| ------ | --- | ------- |
| **A. Locale as an optional route parameter** | `src/pages/[...locale]/index.astro`, `[...locale]/work/[slug].astro`, and so on. `getStaticPaths` yields `undefined` for English (the root) and `es` for Spanish, from `PUBLISHED_LOCALES` | **Recommended.** One file per page, so both locales cannot drift. Publishing Italian later is a one-word change |
| B. Copy each page under `src/pages/es/` | Thin wrappers that pass `locale="es"` | Doubles the page files, and every future page has to remember its copies |

The pages and the CV, the palette endpoint and the preview cards all move to A.

### Content

- `src/content/site/es.yaml` and `src/content/cases/es/*.md`, with the same schema as English.
- `src/i18n/ui/es.ts`, typed as `Record<UiKey, string>`, so a missing key is a type error.
- Metric values are written already localised ("45,6 % → 100 %", "112 en cola"), because they
  are copy, not numbers. `splitNumeric` learns the locale's decimal separator, so count-up
  animates "45,6" correctly.
- **Spanish variant:** neutral Spanish, readable in Spain and Latin America. No *vosotros*, no
  regional vocabulary, and the site's first-person voice. `Intl` uses plain `es`, which gives
  `12 mil`, `1,50 US$` and `sept 2024`.

### Profile-derived text

The CV and the timeline print fields from `public-profile.json`, which is in English.

| Field | Proposal |
| ----- | -------- |
| Job titles ("Technical Lead - AI Products", "AI Engineer") | **Kept in English.** It is the norm in Spanish-language tech CVs, and they must match LinkedIn and the references a recruiter checks |
| Technologies and product names | Kept as they are |
| Places ("USA - Remote"), language names and levels ("Native (C2)"), degree names, section labels | Translated through a `profile` map in `ui/es.ts`, keyed by the English value. A build check fails if a value shown on a Spanish page has no translation, so a new role in `profile.md` cannot ship half-translated |

### Switcher and suggestion

- **`LocaleSwitch`** renders plain links to the same path in each published locale, so it
  works without JavaScript. It is in the desktop nav and the phone menu, as drawn. A small
  script appends the current `#section` to the link on click, so the visitor lands on the
  same section.
- **`LocaleSuggestion`** is server-rendered as `hidden`, with the frames' copy for each
  target locale. A module under 1 KB unhides it only when the story's four conditions hold.
  The decision is a pure function, `suggestLocale(languages, published, dismissed)`, tested
  with the story's table. Dismissing it, or choosing English in the switcher, stores
  `locale-suggestion=dismissed` in `localStorage`. If storage throws, the suggestion is
  simply not remembered.
- It floats, as drawn, so revealing it causes no layout shift and the CLS budget is safe.

### Review of the translation

2,700 words is too much to approve in chat.
- **Recommended:** one review file, `spdd/reviews/004a-es.md`. It has a table per section:
  key, English, Spanish, and a status column Jesus fills in with `ok` or a correction.
- He can edit it in any editor, the table is diffable, and it stays in the repository as the
  approval record.
- The code is only built from rows marked `ok`. The review file and the content files have
  to match, which a small test checks.

### Checks

- `check-links` and `check-previews` already walk every page in `dist/`, so they cover
  `/es/` once it exists.
- The overflow audit adds `/es/` and `/es/work/02-cost-leak/`, the longest locale.
- A new test checks that every `ui` key, every `site` field and every case exists in both
  locales.

## 3. Risks

| Risk | Mitigation |
| ---- | ---------- |
| Spanish runs 15–30% longer and breaks a layout: the headline, the proof rows, the metric panels | The overflow audit runs on `/es/` at all 12 widths. If the headline goes past three lines, Jesus chooses a shorter wording in the review rather than the layout changing |
| A translation changes a claim | The review table shows English and Spanish side by side. The truthfulness norm applies to every row, and figures are checked cell by cell |
| The route refactor breaks the English site | English URLs are asserted unchanged: the link checker, the sitemap and the same six Lighthouse URLs, plus the Spanish ones |
| Lighthouse time doubles | 12 URLs × 3 runs is still a few minutes. `maxAutodiscoverUrls` rises from 20 only if needed |
| The suggestion script shows up in the JavaScript budget | Under 1 KB, against 15 KB, and measured |

## 4. Decisions

**✅ Decision 1 — routing.** Confirmed 2026-09-30: A, an optional `[...locale]` route parameter.

**✅ Decision 2 — profile-derived text.** Confirmed 2026-09-30: job titles, technologies and products
stay in English; places, language levels, degrees and labels are translated through a
checked map.

**✅ Decision 3 — review format.** Confirmed 2026-09-30: `spdd/reviews/004a-es.md`, a table per section
with a status column; only `ok` rows ship.

**✅ Decision 4 — Spanish variant.** Confirmed 2026-09-30: neutral Spanish for Spain and Latin America,
first person, no *vosotros* and no regionalisms.

## 5. Follow-up — the phone suggestion covers the page (2026-10-03)

Found during story 009 and reproduced on 2026-10-03 on the production build, in headless
Chromium with `navigator.languages = ['es-ES']`, at 320, 360, 390, 430, 600, 767 and 768 px.

### Diagnosis

The phone pill is absolutely positioned under the nav (`top-17`, 68–118 px from the top),
and on phones every page starts its content right there.

| Page | 320–767 px | ≥ 768 px |
| ---- | ---------- | -------- |
| Case (`/work/<slug>/`) | Covers "All work" (88–108 px); the link's centre hits the pill, so it cannot be tapped | Card under the switcher, no overlap |
| `/privacy/` | Covers "Home" the same way | No overlap |
| `/` | Covers the identity row: avatar, name, role and city. The approved frame already drew it there | No overlap |
| `/cv/`, every `/es/` page | No suggestion | — |

At 320 px the pill's text also wraps, leaving the arrow alone on a second line (50 → 70 px).
The suggestion stays until it is dismissed, so a visitor who neither switches nor dismisses
it cannot reach the back link.

### Direction

| Option | How | Verdict |
| ------ | --- | ------- |
| A. In the page flow under the nav, decided before first paint | An inline script marks `<html>` before paint, so the pill renders in place with no layout shift | Rejected after the mockup: it moves the page down 48 px, and in `Home — Phone 390` the third proof metric goes under the contact bar, which breaks story 001's fold. It also adds a render-blocking script |
| B. Floating at the bottom, above the contact bar | A toast | Rejected: it would cover the proof metrics that story 001 keeps above the fold |
| **C. Inside the nav row** | On phones the nav holds only the monogram and the menu; the pill sits between them, 176 × 32 px, with the shorter text "Ver en español" | **Recommended.** It covers nothing and moves nothing, so the existing reveal script stays and CLS cannot change. It fits at 320 px with about 20 px each side, and the close button keeps a target of at least 24 px |

Frames: `Home — Phone 390 · i18n suggestion` (redrawn), `Nav — Phone 320 · i18n suggestion` and
`Case — Phone 390 · i18n suggestion` (new).

### Risks

| Risk | Mitigation |
| ---- | ---------- |
| A longer target-language label would not fit at 320 px when Italian is published | The overflow audit runs at 320 px with the suggestion shown; story 004b rechecks it with its own text |
| The nav row grows taller than 64 px and shifts the page | The pill is 32 px tall, as the monogram; the check measures the nav height with and without the pill |
| The menu sheet and the pill overlap | The sheet opens below the nav row (`top-16`); the end-to-end check opens the menu with the pill shown |

**✅ Decision 5 — phone suggestion placement.** Confirmed 2026-10-03: option C, the pill inside
the nav row on phones, with the text "Ver en español" (the approved `suggest.action` string,
already used on the desktop card), replacing "Ver este sitio en español →". Jesus first approved
A; the mockup showed the fold failure, and he then approved C, the text and the frames, all on
2026-10-03.
