# Analysis — Phase 1.5: A wrong address still lands

Step 3 of the SPDD flow for story [012](../stories/012-a-wrong-address-still-lands.md),
approved on 2026-10-06. Inputs: the story's evidence, the frames `Not found — Desktop 1440`,
`Not found — Phone 390` and their `· es` versions with their copy (approved 2026-10-07, see
[../design.md](../design.md)), `Base.astro`, `Nav.astro`, `LocaleSwitch.astro`,
`LocaleSuggestion.astro`, `astro.config.mjs`, `src/lib/previews.ts`, `src/lib/track.ts`,
`lighthouserc.json` and its coverage test.

## 1. Diagnosis

| Piece | Today | What a 404 page needs |
| ----- | ----- | --------------------- |
| GitHub Pages | Serves `404.html` from the site root, with status 404, for every missing address; the site has none, so GitHub's own page shows | A root `404.html` in `dist/` |
| Pages | All routes live under `src/pages/[...locale]/`, one copy per published locale | One page outside the locale routes, because Pages serves a single file for both languages |
| Language | Chosen by the route at build time | Chosen from the visitor's address, which only the browser knows |
| `LocaleSwitch` | Links to the same path in the other locale (`stripLocale(Astro.url.pathname)`) | On the 404 page that path is `/404`, so it would link to a page that does not exist |
| `LocaleSuggestion` | Offers the same path in the visitor's language | Same problem: it would offer `/es/404` |
| `Base` | Has a `noindex` prop | Used as is |
| Sitemap | Filters out `/cv/` and `/og/` | Must not list the 404 page; checked on the build |
| Preview check | Skips pages marked `noindex` (`previews.ts`) | No preview card needed |
| Tracker | Sends `$pageview` with `$current_url` and the `<html lang>` as `locale` | Counts the missing address as it is, once `lang` is right |
| Lighthouse | 14 URLs; a test asserts the list equals the published pages | The 404 page joins the audit and the test |

## 2. Direction

### Decision 1 — One page at the root

`src/pages/404.astro`, built to `dist/404.html`, which GitHub Pages serves with status 404 for
any missing address. It uses `Base` with `noindex`, the same tokens and type, and no contact
bar, like the privacy note.

### Decision 2 — The language comes from the address, before the first paint

| Option | Verdict |
| ------ | ------- |
| **A. Both languages in the file; a tiny inline script in `<head>` picks one** | **Recommended.** The script reads `location.pathname` and, for `/es/…`, sets `lang="es"`, a `data-locale` attribute and the Spanish title on `<html>` before the body is drawn. CSS shows the matching copy, so there is no flash and no layout shift. Without scripts the page is in English, with working links |
| B. Both languages always shown, one under the other | Works without scripts, but doubles the page for every visitor |
| C. A script that redirects `/es/…` to a separate Spanish 404 page | A second request and a visible redirect, and the missing address is lost from the bar |

The inline script is a few lines, so it costs nothing measurable against the 15 KB budget,
and the tracker then reads the right `lang` when it sends the page view after `load`.

### Decision 3 — The navigation on the 404 page

- Each language block renders its own `Nav`, so links, labels and the switch are in that
  language.
- The language switch links to the **home page** of the other language, since the missing
  address has no equivalent. `Nav` and `LocaleSwitch` gain an optional target for that.
- **No language suggestion** on this page: it would offer a page that does not exist.
- Ids that would appear twice, once per language block, are avoided or suffixed, so the
  accessibility audit stays at 100.

### Decision 4 — Indexing, previews and the sitemap

`noindex` through `Base`; the preview check already skips `noindex` pages. The sitemap must
not list it: the build is checked, and the sitemap filter gains `404` if the integration does
not drop it on its own.

### Decision 5 — Analytics and the privacy note

The default page view is enough: `$current_url` carries the missing address and `locale` the
language picked. No new event, no new property. The privacy note already says the site records
which page is opened, so it stays accurate without a change.

### Decision 6 — Checks

- `lighthouserc.json` gains `http://localhost/404.html`; `tests/lighthouse-urls.test.ts`
  expects it alongside the published pages. With 15 URLs, the seven shards hold 2 or 3 each.
- The link check covers the page like any other built page.
- On the published site: the four addresses from the story answer 404 with this page, in the
  right language.

## 3. Risks

| Risk | Mitigation |
| ---- | ---------- |
| A Spanish visitor sees English for a moment | The language is set in `<head>`, before the body is parsed; the end-to-end check screenshots `/es/…` straight after load |
| Duplicate ids or two `<main>` landmarks hurt accessibility | The hidden block is `display: none`, which removes it from the accessibility tree; ids are not repeated; Lighthouse accessibility stays at 100 |
| A future page under `/es/` 404s and gets the English copy without scripts | Accepted: without scripts the English page still links to the Spanish home |
| The case list goes stale when a case is added or renamed | The list is built from the case collection at build time, like the home page's |
| Lighthouse's static server answers `404.html` with status 200 | The audit measures the page itself; the 404 status is checked on the published site |

## 4. Decisions

**⚠️ Pending — 1, one page at the root.** Recommended: `src/pages/404.astro` → `dist/404.html`.

**⚠️ Pending — 2, the language.** Recommended: A, both languages in the file, chosen by an inline
`<head>` script from the address; English without scripts.

**⚠️ Pending — 3, the navigation.** Recommended: a `Nav` per language; the switch leads to the
other language's home page; no language suggestion; no repeated ids.

**⚠️ Pending — 4, indexing.** Recommended: `noindex`, out of the sitemap, no preview card.

**⚠️ Pending — 5, analytics.** Recommended: the default page view only; the privacy note stays.

**⚠️ Pending — 6, checks.** Recommended: the page joins the Lighthouse audit and its coverage test;
the published site is checked for the 404 status on the story's four addresses.
