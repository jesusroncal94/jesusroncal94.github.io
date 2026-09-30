# 004a — Spanish

Story: [004](../stories/004-read-it-in-my-language.md), part a. Analysis:
[Phase 3, 004a](../analysis/phase-3-004a-spanish.md). Penpot, page Home:
`Home — Desktop 1440 · i18n`, `Home — Phone 390 · i18n suggestion`,
`Home — Phone 390 · i18n menu` (see [../design.md](../design.md)).

**Status:** approved on 2026-09-30. Half 1 (operations 1–7) implemented and synced on 2026-10-01; half 2 (operations 8–11) not started.

## R — Requirements

The whole site is published in Spanish at `/es/`, beside the unchanged English site.

- Home, case studies, CV page and PDF, command palette and preview cards exist in Spanish,
  in neutral Spanish, with Spanish formats.
- A language switcher in the nav and the phone menu links to the same page in the other
  locale, and keeps the section.
- A suggestion appears only under the story's four conditions, and is remembered once
  dismissed.
- Job titles, technologies and products stay in English. Every other profile-derived string
  is translated through a checked map.
- Only copy that Jesus marked `ok` in `spdd/reviews/004a-es.md` ships.
- Italian stays unpublished.

**Done when:**
- `/es/`, `/es/work/<slug>/` and `/es/cv/` build and link to each other.
- English URLs, and their HTML apart from the new switcher, are unchanged.
- The suggestion tests (the story's table) pass.
- Every review row is `ok` and matches the content.
- Link, preview, overflow (both locales, 12 widths) and Lighthouse checks pass.
- `dist/cv/jesus-roncal-cv-es.pdf` is two A4 pages or fewer.

## E — Entities

```ts
localeRoutes(): { params: { locale: string | undefined }, props: { locale: Locale } }[]
splitNumeric(value: string, locale: Locale): NumericParts | null   // decimal separator by locale
ogImagePath(locale: Locale, slug?: string): string                  // /og/home.jpg, /og/es/work/<slug>.jpg
localiseProfile(value: string, locale: Locale): string               // throws when a translation is missing
suggestLocale(languages: readonly string[], published: readonly Locale[], dismissed: boolean): Locale | null
ReviewRow { key: string; en: string; es: string; status: 'ok' | string }
```

## A — Approach

Decisions 1–4 of the analysis. The work lands in two halves.

1. **Infrastructure (operations 1–7), with `PUBLISHED_LOCALES = ['en']`.**
   - Routes, formats, the switcher, the suggestion and the checks are built and verified
     while the published output is still English only.
   - Each operation keeps the English site byte-identical, except for the switcher markup.
2. **Content (operations 8–10).**
   - I draft the translation into the review file, and Jesus reviews it.
   - The Spanish content files are generated from the approved rows.
   - Adding `es` to `PUBLISHED_LOCALES` is the single switch that publishes it.

## S — Structure

```
src/i18n/locales.ts              + localeRoutes
src/i18n/ui/es.ts                Spanish UI strings, typed Record<UiKey, string>
src/i18n/profile/es.ts           Spanish map for profile-derived strings
src/i18n/profile.ts              localiseProfile
src/i18n/translate.ts            + es dictionary
src/lib/count-up.ts              splitNumeric by locale
src/lib/preview.ts               ogImagePath(locale, slug?)
src/lib/suggest-locale.ts        suggestLocale
src/pages/[...locale]/…          index, work/[slug], cv, palette.json, og/index, og/work/[slug]
src/components/LocaleSwitch.astro
src/components/LocaleSuggestion.astro
src/scripts/locale.ts            hash carry-over, suggestion reveal, dismissal
src/content/site/es.yaml
src/content/cases/es/*.md
spdd/reviews/004a-es.md          review table, the approval record
tests/suggest-locale.test.ts, tests/locale-parity.test.ts, tests/review.test.ts
astro.config.mjs                 sitemap i18n alternates
```

## O — Operations

1. **Routes.** `localeRoutes()` maps `PUBLISHED_LOCALES` to static paths, with `undefined`
   for English. Every page moves under `src/pages/[...locale]/` and takes `locale` from
   props: index, `work/[slug]`, `cv`, `palette.json`, and the preview cards. Check: the
   English `dist/` has the same file list, and its HTML is byte-identical to the build
   before the move.
2. **Count-up by locale.** `splitNumeric(value, locale)` reads the decimal separator from
   `Intl.NumberFormat(locale).formatToParts(1.1)`. A test covers "45.6%" in `en` and
   "45,6 %" in `es`.
3. **Localised preview paths.** `ogImagePath(locale, slug?)`: English keeps `/og/home.jpg`
   and `/og/work/<slug>.jpg`, and other locales use `/og/<locale>/…`. The render script
   already derives cards from the built directory.
4. **Profile map.**
   - `localiseProfile(value, locale)` returns the value unchanged for English.
   - For Spanish it returns the entry in `profile/es.ts`, and throws a named error when
     the entry is missing, so the build fails.
   - It applies to places, language names and levels, degrees and CV section labels. Job
     titles, technologies and products never pass through it.
5. **`LocaleSwitch`** (frames `· i18n` and `· i18n menu`).
   - Links to `localePath(other, stripLocale(path))` for each published locale, showing
     `EN · ES` in the nav and `English · Español` in the menu row. `aria-current` marks the
     active locale, and each link has `hreflang` and `lang`.
   - It renders nothing while only one locale is published.
   - A delegated click handler in `src/scripts/locale.ts` appends `location.hash` to the
     link. Choosing English also stores the dismissal.
6. **`suggestLocale` and `LocaleSuggestion`.**
   - `suggestLocale` walks `languages` in order. It returns the first published
     non-English locale that appears before any `en*` entry, or `null`, and `null` when
     `dismissed`. The story's six rows are its test.
   - The component is server-rendered `hidden`, with one variant per target locale: the
     desktop card anchored under the switcher, and the phone pill under the nav.
   - `locale.ts` reveals it on English pages when `suggestLocale` returns a locale. Close
     and "Ver en español" both store `locale-suggestion=dismissed`, and storage errors are
     swallowed.
   - It is fixed-positioned, so it causes no layout shift.
7. **Parity and sitemap.**
   - `tests/locale-parity.test.ts` asserts that every published locale has a `site` entry,
     the same case slugs, and every UI key.
   - The sitemap gains `i18n: { defaultLocale: 'en', locales: { en: 'en', es: 'es' } }`,
     so it lists alternates.
8. **Review file.**
   - I write `spdd/reviews/004a-es.md`, one table per section (UI, hero, metrics, work,
     open source, experience, principles, contact, CV, then each case). Each table has the
     columns `key | English | Español | status`, and each case body is split by paragraph.
   - Status starts empty. Jesus marks `ok` or writes a correction; corrections are applied
     and re-marked.
   - `tests/review.test.ts` asserts that every row is `ok` and that each Spanish cell
     equals the value at its key in the content.
9. **Spanish content.** `site/es.yaml`, `cases/es/*.md`, `ui/es.ts` and `profile/es.ts`,
   written from the approved rows. Metric values are written localised ("45,6 % → 100 %",
   "112 en cola").
10. **Publish.** `PUBLISHED_LOCALES = ['en', 'es']`.
11. **Check.**
    - The overflow audit adds `/es/` and `/es/work/02-cost-leak/`, and a headline over three
      lines goes back to the review.
    - Screenshots of the switcher, the menu and the suggestion are compared with the frames.
    - An end-to-end run in headless Chromium covers:
      - `navigator.languages = ['es-ES']` shows the suggestion, and `['en-US', 'es']` does
        not;
      - dismissal survives a reload;
      - switching from `/work/02-cost-leak/#result` lands on `/es/work/02-cost-leak/#result`.
    - Tests, link and preview checks, the PDF page count and Lighthouse on all twelve URLs.

## N — Norms

All of [norms.md](norms.md). In particular:
- "Every visible string comes from content or the i18n dictionary": the suggestion copy
  lives in `ui/*.ts`.
- "Truthfulness": translation never adds, rounds or softens a claim, and every figure is
  checked in the review.
- "Links carry their page": switcher links are built with `localePath`.

## S — Safeguards

- **English unchanged:** the English site stays byte-identical apart from the switcher,
  which operation 1's check proves.
- **Italian unpublished:** `it` stays out of `PUBLISHED_LOCALES`, so no Italian page,
  preview card, sitemap entry or suggestion is produced.
- **No tracking:** the suggestion reads only `navigator.languages` and `localStorage`. No
  request, no cookie, no location.

## Sync — 2026-10-01 (half 1: operations 1–7)

Implemented with `PUBLISHED_LOCALES = ['en']`. This section is authoritative where it differs
from the operations above.

- **Op 1.**
  - `localeRoutes()` returns one static path per published locale, with `locale: undefined`
    for English.
  - The case pages combine it with their slugs.
  - `palette.json` became `[...locale]/palette.json.ts`.
  - Moving the files changed only Astro's scoped-style hash on `/cv/`, which derives from
    the file path.
- **Op 3.**
  - Cards follow the route convention, with the locale first: `/es/og/home.jpg` and
    `/es/og/work/<slug>.jpg`, not `/og/es/…`.
  - `render-artifacts.ts` walks every published locale's `og/` directory.
  - `versionPreviewUrls` matches the whole path after the origin.
  - The preview weight check matches any `og/` directory.
  - `OgCard` takes the locale for its `lang`.
- **Op 4.** `localiseProfile` also covers the city in the hero and on the home card. The
  CV applies it to the city, role locations, the degree and institution, skill groups, and
  language names and levels.
- **Op 5.**
  - `LOCALE_NAMES` holds the endonyms (English, Español, Italiano), and `isMultilingual()`
    guards the markup, so a single-locale site renders exactly as before.
  - Compact links carry `aria-label="EN — English"`, which contains the visible label.
- **Op 6.**
  - The suggestion sits inside the header, so it scrolls away with it. The desktop card is
    absolutely positioned under the switcher, and the phone pill at `top-17`.
  - Its copy comes from the target locale's dictionary. The English subtitle is
    `suggest.alsoIn` with `language.<target>`.
  - The phone menu sheet moved to `z-40`, because the pill covered the open menu.
- **Op 7.** The parity test runs for each published non-default locale. It checks the site
  file, the same case files, and a translation for every profile value a page shows. Zod
  already validates the structure of each `site` file at build.

**Verified on 2026-10-01.**
- **English build.** After each operation it was compared with the previous build, and it
  stayed byte-identical except for:
  - the count-up script (op 2);
  - the stylesheet, which gained the switcher's and the suggestion's utilities (op 5–6);
  - the phone menu's `z-40` class (op 6).

  The preview cards, their versioned URLs and the sitemap are unchanged.
- **Tests:** 23 unit tests pass, including the story's six suggestion cases.
- **Throwaway multilingual build.** A copy inside the container published `es` with the
  English content as a stand-in, and an end-to-end run in headless Chromium checked it:
  - the six suggestion cases matched;
  - dismissal survives a reload;
  - switching from `/work/02-cost-leak/#result` lands on `/es/work/02-cost-leak/#result`;
  - without JavaScript the switcher is plain links and the suggestion stays hidden;
  - screenshots at 1440 × 900 and 390 × 844, with the menu open, match the three frames.

  Until `ui/es.ts` exists, the suggestion falls back to the English dictionary.
