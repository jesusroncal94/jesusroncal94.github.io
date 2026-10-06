# 012 — A wrong address still lands

Story: [012](../stories/012-a-wrong-address-still-lands.md). Analysis:
[Phase 1.5](../analysis/phase-1-5-not-found.md). Penpot, page Home: `Not found — Desktop 1440`,
`Not found — Phone 390`, `Not found — Desktop 1440 · es`, `Not found — Phone 390 · es` (see
[../design.md](../design.md)).

**Status:** written on 2026-10-07; the story, the frames and the page's copy (English and
Spanish, approved 2026-10-07) and decisions 1–6 were approved. Waiting for the start.

## R — Requirements

Every missing address on the site lands on a page of the site, in the visitor's language, with
the way on.

- `dist/404.html` exists, in the frames' design, and GitHub Pages serves it with status 404.
- Addresses under `/es/` get the Spanish copy; all others, and every visitor without scripts,
  get English.
- Each language block has its own navigation; the switch leads to the other language's home;
  no language suggestion.
- The four case studies are listed by title, from the case collection.
- `noindex`, no canonical or alternate links, out of the sitemap, no preview card.
- The default page view records the missing address and the language.

**Done when:**
- Screenshots match the four frames.
- The overflow audit reports zero overflow on the page at all 12 widths, in both languages.
- Tests pass, including the Lighthouse coverage test with the page added; the link and preview
  checks pass; the sitemap does not list the page.
- Lighthouse passes on the page in CI, accessibility 100.
- On the published site, `/does-not-exist/`, `/es/no-existe/`, `/work/99-missing/` and
  `/es/work/99-missing/` answer 404 with this page, in the right language.

## E — Entities

```ts
// src/i18n/ui/*.ts
'notFound.title' | 'notFound.lead' | 'notFound.accent' | 'notFound.lede' | 'notFound.home' | 'notFound.cases'

// Base.astro
canonical?: boolean            // default true; false drops canonical, alternates and og:url
<slot name="head" />           // for the page's language script

// Nav.astro, LocaleSwitch.astro
switchToHome?: boolean         // the switch links to the other locale's home
suggestion?: boolean           // default true; false renders no LocaleSuggestion
```

## A — Approach

Decisions 1–6 of the analysis.

1. **One file, two languages.** `404.astro` renders an English and a Spanish block, each a
   `Nav` plus the article. An inline script in `<head>` sets `lang`, `data-locale` and the
   title on `<html>` from `location.pathname` before the body is parsed; CSS hides the other
   block with `display: none`.
2. **Reuse, with two switches.** `Nav` and `LocaleSwitch` take two optional props, so every
   other page renders exactly as before.
3. **Nothing new to measure.** The tracker's page view already carries the address and reads
   `lang`.

## S — Structure

```
src/i18n/ui/en.ts, es.ts            + notFound.*
spdd/reviews/004a-es.md             + notFound.* rows (approved 2026-10-07)
src/layouts/Base.astro              + canonical prop, head slot
src/sections/Nav.astro              + switchToHome, suggestion; menu script for every menu
src/components/LocaleSwitch.astro   + switchToHome
src/pages/404.astro                 the page
astro.config.mjs                    sitemap filter, if the build lists the page
lighthouserc.json, tests/lighthouse-urls.test.ts   + 404.html
```

## O — Operations

1. **Copy.** The six `notFound.*` keys in both dictionaries, in the approved wording; the
   review file gains their rows, marked approved, so the review test keeps matching every UI
   key. "Email me" and the case titles reuse existing strings.
2. **Shared pieces.**
   - `Base`: `canonical` (default true) and `<slot name="head" />` at the end of `<head>`.
   - `LocaleSwitch`: with `switchToHome`, each link goes to `localePath(target)`.
   - `Nav`: passes `switchToHome` on, and with `suggestion={false}` renders no suggestion.
     Its menu script closes every menu on the page (`querySelectorAll`), since the 404 page
     has two.
   - Check: every other page's HTML is unchanged apart from the menu script.
3. **The page.** `src/pages/404.astro`:
   - `Base` with `noindex`, `canonical={false}`, the English title and description.
   - The head script: for a path starting `/es/`, `lang="es"`, `data-locale="es"` and the
     Spanish title.
   - Two blocks, `data-copy="en"` and `data-copy="es"`, each with `Nav` (`switchToHome`,
     `suggestion={false}`) and the article as drawn: eyebrow "404", the two-line headline,
     the lede, the home and email buttons, and the case list from the collection, linked with
     `casePath`. No `id` repeats across the blocks.
   - CSS: the Spanish block is hidden unless `html[data-locale="es"]`; then the English one is.
4. **Sitemap and audit.**
   - If the built sitemap lists the page, its filter drops it.
   - `lighthouserc.json` adds `http://localhost/404.html`; the coverage test expects
     `/404.html` beside the published pages.
5. **Check,** on the production build, then on the published site after the merge.
   - Screenshots of `/404.html` and `/es/x/` (served the 404 file) against the four frames,
     including straight after load for Spanish.
   - Overflow at 12 widths in both languages; scripts off shows English with working links.
   - Tests, link and preview checks, the sitemap; Lighthouse in the pull request's CI.
   - After the deploy: the four addresses answer 404 with this page, in the right language.

## N — Norms

All of [norms.md](norms.md). In particular:
- "Every visible string comes from content or the i18n dictionary": the page's copy lives in
  `ui/*.ts`, and the case titles come from the collection.
- "Links carry their page": every link is built with `localePath` or `casePath`.
- "Works without JavaScript": without scripts the page is complete in English.

## S — Safeguards

- No other page changes, apart from the menu script handling more than one menu.
- No new request and no new script file; the language script is inline and a few lines.
- Accessibility stays at 100: one visible `main`, no repeated ids.
- The privacy note stays accurate without a change: page views already record the page opened.
