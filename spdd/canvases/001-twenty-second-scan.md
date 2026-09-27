# 001 — Twenty-second scan

Story: [001](../stories/001-twenty-second-scan.md). Figma: Desktop Nav `3:6`, Hero `3:23`,
Proof `3:78`; Mobile Nav `8:6`, Hero `8:14`, Proof `9:197`, fold marker `9:194`.
Components: `StatusChip 2:93`, `Button 2:92`, `MetricTile 2:98`.

**Status:** implemented and synced. Story 001 closed on 2026-09-24, when canvas 003 added the mobile contact bar.

## R — Requirements

The first screen answers "who, what level, does he fit" in under twenty seconds.

- Phone (390 × 844): name, headline, the three proof rows and the sticky "Download CV" bar
  visible without scrolling.
- Desktop (1440): the same plus the portrait, its two role badges, and the hero prompt.
- Every metric is a measured outcome with context; the location line reads
  "Based in Milan · open to roles across the EU".

**Done when:** the home page matches the Figma frames at both widths; LCP ≤ 1.5 s and
CLS ≤ 0.02 on Lighthouse mobile; no client JavaScript is required to render the fold.

## E — Entities

```ts
Site {
  displayName: string         // "Jesús Roncal"
  monogram: string            // "jr"
  hero: HeroContent
  metrics: ProofMetric[]
}

HeroContent {
  status: string              // "Open to AI Engineer roles · EU"
  headlineLead: string        // "I ship LLM systems"
  headlineAccent: string      // "that survive production."
  lede: string                // desktop
  ledeShort: string           // mobile, as approved in Figma
  role: string                // "AI & Backend", shown next to the city on mobile
  portraitAlt: string
  portraitCaption: string     // "Milan, IT · ES / EN / IT"
  badges: [{ eyebrow, title }, { eyebrow, title }]
}

ProofMetric {
  value: string; caption: string; source: string
  compact?: { value: string; caption: string }   // the mobile row copy
  accent: boolean                                 // mobile row value in signal
}
```

Four metrics on desktop; on mobile, the ones with `compact` copy, in order. During
implementation the planned `featured` flag and single `location` field were dropped: the
mobile rows use different, shorter approved wording, so `compact` carries both the selection
and the text, and the location reads from the status chip, the lede ("Based in Milan") and
the portrait caption, exactly as in the approved frames.

## A — Approach

Pure server-rendered Astro. The portrait is the desktop LCP element: a hand-written
`<picture>` whose AVIF and WebP sources (420 and 840 px, from `getImage`) only match
`(min-width: 48rem)`, falling back to a transparent pixel, so phones never download it. It
is `loading="eager"` with `fetchpriority="high"`. There is no preload link: sections cannot
write into `<head>`, and the preload scanner already finds the `<picture>` in the initial
HTML. On mobile the portrait is a 56 px avatar, so the headline is the LCP and its fonts are
preloaded. Stylesheets are inlined into the HTML (`build.inlineStylesheets: 'always'`),
which removes a round trip from the headline's critical path. The aurora is a CSS radial
gradient on a static layer, never a live `filter: blur()`. The only motion is a single
fade-up on the proof block, disabled under reduced motion; it was moved off the headline so
that it can never hold back the LCP.

## S — Structure

```
src/content.config.ts             collection `site` (glob loader over src/content/site/*.yaml)
src/content/site/en.yaml          hero and metrics
src/lib/site.ts                   getSite(locale), which fails loudly when a locale has no content
src/assets/portrait.jpg           660 × 845 crop of the source photo, above the strap
src/assets/avatar.jpg             336 × 336 square crop for the mobile avatar
src/components/StatusChip.astro   props: label
src/components/Button.astro       props: variant ('primary'|'secondary'|'ghost'), href?, icon?, download?, track?
src/components/Icon.astro         props: name — inline SVG from a fixed set (lucide paths)
src/components/MetricTile.astro   props: value, caption, source
src/sections/Nav.astro
src/sections/Hero.astro
src/sections/Proof.astro
src/pages/index.astro
```

## O — Operations

1. **Content collection `site`** in `content.config.ts`, with a Zod schema for `hero` and
   `metrics` (`ProofMetric[]`), keyed by locale id. `src/content/site/en.yaml` holds the
   approved copy verbatim from the Figma frames.
2. **`Icon.astro`**: `name` ∈ `arrow-right | arrow-up-right | arrow-up | download | mail |
   sparkles | menu | close | copy | check`; renders a 24-viewBox SVG using `currentColor`, with a
   `size` prop and `aria-hidden="true"`.
3. **`StatusChip.astro`**: pill with the live dot (signal fill with a soft glow) and a
   `label-mono` label; Figma `2:93`.
4. **`Button.astro`**: renders `<a>` when `href` is set, otherwise `<button>`. Variants map to
   Figma `2:92`: primary = signal fill with on-signal text; secondary = raised fill with a
   strong border; ghost = muted text. Optional leading icon; pass-through `download` and
   `data-track`.
5. **`MetricTile.astro`**: the desktop tile (surface, border, `radius-md`, source → value
   `metric-m` → caption), filling its grid cell. Matches `2:98`. The mobile rows (`9:197`)
   live in `Proof.astro` instead, because they render the `compact` copy rather than a
   second layout of the same text.
6. **`Nav.astro`**: brand mark "jr" plus the name (visually hidden below `md`), anchor links
   `#work`, `#open-source`, `#experience` from `md` up, and a secondary "Email me" button
   (a `mailto:` link until 003). The locale indicator is not rendered while only one locale
   is published; it arrives with story 004. Mobile shows the menu icon, which opens a
   `<details>`-based sheet that works without JavaScript; a two-line script closes it when a
   link is followed.
7. **`Hero.astro`**:
   - left column: `StatusChip`, then `<h1>` with the lead in `display-xl` and the accent in a
     `<span class="display-serif text-signal">` on its own line; the lede in `body-l`
     (`max-width` 620 px); CTAs: primary "Download CV", secondary "Email me", ghost "See the
     work" linking to `#work`;
   - right column (`md` and up): the portrait at 420 × 540, radius 28, strong border, a
     bottom fade to canvas, two badge cards absolutely positioned, framing the face on a diagonal:
     the current role at top 64 px overhanging the left edge by 56 px, the lead role at
     bottom 24 px overhanging the right edge by 56 px (amended 2026-09-27, see below), and the location line inside the fade;
   - mobile: the avatar row (56 px circle, signal ring, name and "AI & Backend · Milan")
     above the headline; headline in `display-mobile` with the accent at 50 px;
   - the hero prompt slot below the columns, filled by the command palette in 002;
   - the aurora pseudo-element behind the prompt.
8. **`Proof.astro`**: grid of four `MetricTile` from `md` up (gap 20); below `md` the
   metrics with `compact` copy as rows (value in `metric-s`, 152 px, never wrapping; caption
   in `body-s`; top border), the `accent` one in signal.
9. **`pages/index.astro`**: `Base` layout with the English title and description; renders
   Nav, Hero and Proof, plus the sections from 002 and 003 as they land.
10. **Visual check**: screenshots at 390 × 844 and 1440 × 900 compared against the Figma
    frames. The mobile fold must end below the third proof row and above the contact bar.

**Verified on 2026-09-23:**
- Desktop matches the Figma frame.
- On mobile, the third proof row ends at y = 706, above where the contact bar starts
  (764), and the phone downloads only the avatar.
- Lighthouse mobile, three runs: 100 in performance, accessibility, best practices and
  SEO; LCP 1.37 s (the headline); CLS 0; TBT 0; no assertion failures.
- Lighthouse desktop: 100 in all four categories, with an LCP of 0.38 s (the portrait in
  AVIF).
- Until canvas 003 adds the sticky contact bar, phones have no "Download CV" above the
  fold. Story 001 is only complete once 003 lands.

## N — Norms

All of [norms.md](norms.md). Content comes only from `site/en.yaml` and
`data/public-profile.json` (the name and city).

## S — Safeguards

- The portrait asset is cropped above the bag strap, as in Figma; it is not the raw selfie.
- The "Based in Milan" line never mentions visa status.
- The fold contains no element that needs JavaScript to be visible.

**Sync, 2026-09-23 (from canvas 002):** stylesheets are no longer inlined. Once the home page
grew, inlining pushed the HTML past the first TCP round trip (16 KB compressed), which cost
more than the separate request it saved. The stylesheet is a cached file again, the HTML is
8.9 KB compressed, and the fonts are subset (see canvas 000). Home LCP is 1.38 s, stable
across runs.

**Amendment, 2026-09-27 (portrait badges).** The second badge sat at `196/300` inside the
portrait, the Figma coordinates, which were drawn before the real photo existed. On Jesus's
portrait it covered the mouth and glasses. The Penpot desktop frame now places it in the
bottom-right corner, 24 px from the bottom and overhanging the right edge by 56 px, mirroring
the first badge. The two frame the face on a diagonal and share the bottom row with the
location line. Jesus approved the frame on 2026-09-27.

## Sync — 2026-09-27

The amendment above is implemented: the second badge in `Hero.astro` moved from
`top-75 left-49` to `bottom-6 -right-14`.

**Verified on 2026-09-27, on the production build:**
- **Badge geometry.** At 1280, 1440 and 1920 px the second badge sits 24 px above the
  portrait's bottom edge and overhangs its right edge by 56 px, and stays inside the viewport.
  At 1280 px its right edge is at 1256 px.
- **Screenshots** at 1280 and 1440 px match the Penpot frame: the face is clear, and the
  badge shares the bottom row with the location line.
- **Overflow audit:** zero overflow on `/` and `/work/02-cost-leak/` at all 12 widths.
- **Tests:** 7 unit tests pass.
- **Lighthouse:** all assertions pass on six URLs × 3 runs.
