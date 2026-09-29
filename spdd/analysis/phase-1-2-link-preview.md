# Analysis — Phase 1.2: link preview

Step 3 of the SPDD flow for story [008](../stories/008-link-preview.md). Inputs: the published
site's `<head>`, and the frames `OG — Home`, `OG — Case 02` and `OG — Case 04` on the Social
page of the Penpot file (see [../design.md](../design.md)).

## 1. Diagnosis

`Base.astro` already accepts an optional `image` prop. When it is given, the layout emits
`og:image` and switches `twitter:card` to `summary_large_image`. No page passes it, so every
page falls back to a text-only card. Three smaller gaps:

- no `og:image:width`, `og:image:height` or `og:image:alt`, so some clients fetch the image
  before laying out the card, or show no description for screen readers;
- `og:locale` is the bare locale (`en`) rather than `en_US`;
- nothing checks the head of a built page, so a missing image would go unnoticed, just as
  the broken nav links did.

## 2. Direction

### Generating the images

| Option | How | Verdict |
| ------ | --- | ------- |
| **A. Render pages with Playwright** | One Astro page per card under `/og/`, styled with the site's own tokens, fonts and components. After `astro build`, a script screenshots each page at 1200 × 630 into a JPEG, then deletes the HTML | **Recommended.** Same pipeline as the CV PDF, no new dependency, and the cards use the site's real CSS, so they cannot drift from it |
| B. Satori + resvg | Cards written as JSX objects and rasterised in Node | Two new dependencies and a second styling system that duplicates the tokens. Satori does not read WOFF2, so the fonts would need other formats |
| C. Export from Penpot | Commit the three PNGs | Fails the story: images must follow the content, and there are four cases, not two |

### Shape of the solution

- **Routes.**
  - `src/pages/og/index.astro` renders the home card.
  - `src/pages/og/work/[slug].astro` renders one card per case.
  - Both take their text from the same content as the pages they represent: `site/en.yaml`
    and the case front matter, through `caseEyebrow`.
  - A bare `OgCard` layout sets the 1200 × 630 viewport, the canvas background and the
    aurora, with no nav and no scripts.
- **Rendering.**
  - `scripts/render-cv.ts` becomes `scripts/render-artifacts.ts`. One preview server
    renders the CV PDF and every card, which saves a second server start.
  - Cards are written as `dist/og/home.jpg` and `dist/og/work/<slug>.jpg`, as JPEG at
    quality 85. The home card is a photo, and as PNG it weighs 387 KB, over WhatsApp's
    300 KB.
  - The `/og/` HTML is then deleted, so it is never published, never in the sitemap and
    never audited by Lighthouse.
- **Head.**
  - Pages pass `image` and `imageAlt` to `Base`.
  - `Base` adds `og:image:width`, `og:image:height` and `og:image:alt`.
  - `og:locale` comes from a new `ogLocale(locale)` map: `en_US`, `es_ES`, `it_IT`.
- **Check.** A `findMissingPreviews` function in `src/lib/`, run by
  `scripts/check-previews.ts` after the link check. It fails when an indexable page (one
  without `noindex`) lacks `og:image`, `summary_large_image` or the size tags, or when its
  image path is missing from `dist/`. It also fails if any `.jpg` under `dist/og/` is
  300 KB or larger.

## 3. Risks

| Risk | Mitigation |
| ---- | ---------- |
| A card renders before the fonts or the portrait have loaded | The script waits for `document.fonts.ready` and for every `<img>` to be complete before the screenshot, as the CV does for fonts |
| A long title or metric overflows the card | Case 04, the longest metric, is in the approved frames. The card clips nothing silently: the render script fails if the content box is taller than 630 px |
| LinkedIn caches the old text-only card for about a week | After the deploy, Jesus refreshes the URLs in the Post Inspector, which forces a re-scrape. This is already the definition-of-done check |
| Build time | Five screenshots on the preview server that already runs for the PDF, about a second each |
| Deleting `/og/` HTML hides a broken card page | The deletion happens after the screenshots and the size check, so a broken card fails the build first |

## 4. Decisions

**✅ Decision 1 — generation approach.** Confirmed 2026-09-30: option A. Playwright
screenshots `/og/` pages into JPEGs, and the pages are deleted after rendering.
