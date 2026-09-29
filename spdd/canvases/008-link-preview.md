# 008 — Link preview

Story: [008](../stories/008-link-preview.md). Analysis:
[Phase 1.2](../analysis/phase-1-2-link-preview.md). Penpot, page Social:
`OG — Home 1200×630`, `OG — Case 02 1200×630`, `OG — Case 04 1200×630` (see
[../design.md](../design.md)).

**Status:** written on 2026-09-30, waiting for approval.

## R — Requirements

Every indexable page unfolds into a large preview card when its link is shared.

- The home card shows the portrait, the name, the role, the headline and the site address.
- Each case card shows its eyebrow, its title, its before → after metric, the byline
  "Jesús Roncal · <organisation>" and the site address.
- The cards are rendered at build time from the site's own content, CSS and fonts, as
  1200 × 630 JPEGs under 300 KB.
- Each page's head declares the image with its size and alt text, uses
  `summary_large_image`, and gives `og:locale` in `ll_TT` form.
- A build check fails when a preview is missing, incomplete or too heavy.

**Done when:**
- `dist/og/home.jpg` and `dist/og/work/<slug>.jpg` exist for all four cases, each
  1200 × 630 and under 300 KB, and match the Penpot frames.
- No `/og/` HTML is left in `dist/`, and none is in the sitemap.
- The preview check passes, and fails on a page stripped of its `og:image`.
- Tests and the Lighthouse budget pass.
- After the deploy, Jesus sees the cards in the LinkedIn Post Inspector for `/` and one case.

## E — Entities

```ts
PreviewImage { path: string; alt: string }          // path relative to the site root
ogLocale(locale: Locale): 'en_US' | 'es_ES' | 'it_IT'
ogImagePath(slug?: string): '/og/home.jpg' | `/og/work/${slug}.jpg`
MissingPreview { page: string; reason: string }
findMissingPreviews(files: BuiltFile[]): MissingPreview[]   // BuiltFile from src/lib/links.ts
```

## A — Approach

Decision 1 of the analysis: option A. Each card is an ordinary Astro page under `/og/`, laid
out at exactly 1200 × 630 with the site's tokens, typography and components. After
`astro build`, one render script starts a single preview server. It prints the CV PDF as
before, screenshots each card page to a JPEG, and then deletes the `/og/` HTML, so the pages
exist only long enough to be photographed.

The pages that are shared (`/` and `/work/<slug>/`) pass the image and its alt text to `Base`,
which owns every social tag. A checker in the same style as the link checker reads the built
HTML, so a regression fails the build instead of reaching a recruiter's feed.

## S — Structure

```
src/lib/preview.ts              ogImagePath, PreviewImage
src/i18n/locales.ts             + ogLocale
src/i18n/ui/en.ts               + og.role, og.homeAlt, og.caseAlt
src/layouts/Base.astro          image → PreviewImage; + og:image:width/height/alt, ogLocale
src/layouts/OgCard.astro        1200 × 630 canvas, aurora, no nav, no scripts, noindex
src/pages/og/index.astro        home card
src/pages/og/work/[slug].astro  case cards
src/pages/index.astro           passes the home PreviewImage
src/pages/work/[slug].astro     passes the case PreviewImage
src/lib/previews.ts             findMissingPreviews
scripts/render-artifacts.ts     replaces render-cv.ts: CV PDF + cards, then removes /og/ HTML
scripts/check-previews.ts       runs findMissingPreviews over dist/
tests/previews.test.ts
astro.config.mjs                sitemap filter also excludes /og/
package.json                    build → astro build && render-artifacts && check-links && check-previews
```

## O — Operations

1. **`ogLocale` and `ogImagePath`.**
   - `ogLocale` maps `en → en_US`, `es → es_ES`, `it → it_IT`.
   - `ogImagePath()` returns `/og/home.jpg`, and `ogImagePath(slug)` returns
     `/og/work/<slug>.jpg`.
2. **Copy keys** in `ui/en.ts`:
   - `og.role`: "AI & Backend Engineer";
   - `og.homeAlt`: "Jesús Roncal, AI & Backend Engineer. I ship LLM systems that survive
     production.";
   - `og.caseAlt`: "{title}: {before} to {after}. A case study by Jesús Roncal."

   These are assembled from approved copy, and need Jesus's yes as user-facing text.
3. **`Base.astro`.**
   - `image` becomes an optional `PreviewImage`.
   - When given, it emits the absolute `og:image` (resolved against `Astro.site`), plus
     `og:image:width` 1200, `og:image:height` 630, `og:image:type` `image/jpeg`,
     `og:image:alt` and `twitter:image:alt`.
   - `og:locale` uses `ogLocale`.
4. **`OgCard.astro`.**
   - Uses the same global CSS and fonts as the site, `noindex`, and no scripts.
   - The body is fixed at 1200 × 630 on the canvas colour, with `overflow: hidden`, 64 px
     padding and the aurora ellipse. Its position is a prop: bottom-left on the home card,
     bottom-right on case cards.
   - It exposes `data-og-card` on the root, for the render script.
5. **`/og/index.astro`** (frame `OG — Home`).
   - A 676 px copy column, arranged top to bottom with space between:
     - the brand row: the "jr" mark at 44 px and the name in `heading-h2` at its
       1440-px size;
     - `og.role` · city in `label-mono` signal;
     - the headline, lead in `display` and accent in `display-serif`, at their desktop
       sizes;
     - the address row, `body-l` muted, with the arrow icon.
   - A 340 × 502 portrait at the right, radius 28, with a strong border.
   - Fluid sizes are pinned to their desktop values with explicit classes, because the
     card's viewport is 1200 px.
6. **`/og/work/[slug].astro`** (frames `OG — Case 02/04`).
   - The eyebrow comes from `caseEyebrow`, and the title uses `heading-h2` at its desktop
     size.
   - A `raised` panel, radius 24, fills the remaining height. It holds the before value,
     a 40 px arrow and the after value, in `display` at 76 px, and wraps between values.
   - The footer holds the 56 px avatar with the signal ring, the byline
     "Jesús Roncal · <organisation>" in `heading-h3`, and the address row.
7. **`scripts/render-artifacts.ts`.**
   - Starts one preview server and renders the CV PDFs as `render-cv.ts` does today.
   - Then, for each card page, sets the viewport to 1200 × 630, waits for
     `document.fonts.ready` and every image to be complete, and fails if the scroll height
     of `[data-og-card]` exceeds 630.
   - Takes a JPEG screenshot at quality 85 into `dist/og/…`.
   - Finally removes `dist/og/**/index.html` and the empty directories.
   - The card list is derived from the built `dist/og/` directory, so a new case needs no
     script change.
8. **Pages pass their previews.** `index.astro` passes `ogImagePath()` with `og.homeAlt`,
   and `work/[slug].astro` passes `ogImagePath(slug)` with `og.caseAlt`.
9. **Sitemap.** The filter excludes `/og/` as well as `/cv/`.
10. **`findMissingPreviews`** and **`check-previews.ts`.**
    - For each built page without `noindex`, it requires `og:image`, `og:image:width`,
      `og:image:height`, `og:image:alt` and `twitter:card = summary_large_image`, and
      requires the image's path to exist in `dist/`.
    - It also fails if any `dist/og/**/*.jpg` is 300 KB or larger.
    - A unit test covers one valid page, one page without an image and one noindex page.
11. **Build and CI.** `npm run build` runs `astro build`, then `render-artifacts`,
    `check-links` and `check-previews`. CI already runs `npm run build`, so no workflow
    change is needed.
12. **Check.**
    - Compare the five JPEGs with the frames, and view them at 400 px.
    - Run tests, the overflow audit and Lighthouse.
    - After the deploy, Jesus runs the Post Inspector.

## N — Norms

All of [norms.md](norms.md). In particular:
- "Links carry their page": image URLs are absolute, built from `Astro.site`.
- "Every visible string comes from content or the i18n dictionary": the alt texts and the
  role line are dictionary keys.

## S — Safeguards

- The cards use only approved copy and public profile facts. The alt texts in operation 2
  are the only new strings.
- Nothing from `/og/` is published as HTML, indexed or audited. Only the JPEGs ship.
- No third-party service renders or hosts the images.
