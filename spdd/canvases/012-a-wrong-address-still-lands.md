# 012 — A wrong address still lands

Story: [012](../stories/012-a-wrong-address-still-lands.md). Analysis:
[Phase 1.5](../analysis/phase-1-5-not-found.md). Penpot, page Home: `Not found — Desktop 1440`,
`Not found — Phone 390`, `Not found — Desktop 1440 · es`, `Not found — Phone 390 · es` (see
[../design.md](../design.md)).

**Status:** implemented on 2026-10-07; the story, the frames and the page's copy (English and
Spanish, approved 2026-10-07), decisions 1–6 and the canvas start were approved. Synced below;
waiting for the pull request and the check on the published site.

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

## Sync — 2026-10-07 (operations 1–4)

This section is authoritative where it differs from the operations above.

- **Op 1** (`dfda143`). The keys are `notFound.eyebrow`, `.lead`, `.accent`, `.lede`, `.home` and
  `.cases`: the visible "404" got a key, as every visible string must, and there is no
  `notFound.title`. The tab title is composed from the approved headline in the site's pattern,
  "This page isn't here — Jesús Roncal" and "Esta página no está aquí — Jesús Roncal", and the
  description is the approved lede, so no unapproved string was added. "Case studies" is stored
  in sentence case; the label style sets it in capitals, as drawn. The review test went from 233
  to 239 checks.
- **Op 2** (`5599fb4`). `Base` takes `canonical` (when false: no canonical, alternates or
  `og:url`) and `<slot name="head" />`; `LocaleSwitch` takes `switchToHome`; `Nav` takes
  `switchToHome` and `suggestion`, and its menu script handles every menu. Built before and
  after and compared: `/cv/` and `/es/cv/` are byte-identical; the other 12 pages are identical
  outside their scripts, with exactly one script changed, the menu's.
- **Op 3** (`f955365`). `src/pages/404.astro`.
  - The language script is inline in `<head>` and reads the first path segment against the
    published locales, with their titles passed in at build time. Visibility uses static
    classes per locale (`in-data-locale:hidden`, `hidden in-data-[locale=es]:block`, and the
    same for `it`), because Tailwind only generates classes it finds written out.
  - The verification caught the headline reading "This pageisn't here." in the accessibility
    tree, the line break leaving no space; an explicit space after the break fixed it, as in
    the hero.
  - The sitemap integration already leaves the page out, so its filter did not change.
- **Op 4** (`b02c47b`). `lighthouserc.json` adds `http://localhost/404.html` (15 URLs; shard 0
  now holds three), the coverage test expects it, and the README's "Deploying" says so.

**Verified on 2026-10-07, on the production build** (the preview serves `404.html` for missing
paths with status 404):
- `/does-not-exist/` and `/work/99-missing/`: 404, English, the English title, the home button
  to `/`, four case links. `/es/no-existe/` and `/es/work/99-missing/`: 404, Spanish, the
  Spanish title, the home button to `/es/`, four case links.
- `/es/x/` at `DOMContentLoaded` already shows only the Spanish block.
- With scripts off, `/es/no-existe/` shows the English page with working links.
- The Spanish phone menu opens, its switch links to `/` and `/es/`, and a menu link navigates.
- Zero overflow at all 12 widths, English and Spanish.
- Screenshots of both languages at 1440 and 390 px match the four frames.
- Tests: 279 pass. Build checks: 15 pages, "none broken", every preview complete; the sitemap
  does not list the page.
- **Still to record:** Lighthouse on the page in the pull request's CI, and the four addresses
  on the published site after the deploy.
