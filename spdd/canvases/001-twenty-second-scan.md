# 001 — Twenty-second scan

Story: [001](../stories/001-twenty-second-scan.md). Figma: Desktop Nav `3:6`, Hero `3:23`,
Proof `3:78`; Mobile Nav `8:6`, Hero `8:14`, Proof `9:197`, fold marker `9:194`.
Components: `StatusChip 2:93`, `Button 2:92`, `MetricTile 2:98`.

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
HeroContent {
  status: string              // "Open to AI Engineer roles · EU"
  headlineLead: string        // "I ship LLM systems"
  headlineAccent: string      // "that survive production."
  lede: string
  location: string            // "Based in Milan · open to roles across the EU"
  badges: { eyebrow: string; title: string }[]
}

ProofMetric { value: string; caption: string; source: string; featured: boolean }
```

Four metrics on desktop; the three with `featured: true` on mobile, in that order.

## A — Approach

Pure server-rendered Astro. The portrait is the desktop LCP element: rendered with
`<Picture>` in AVIF and WebP at 420 and 840 px, `loading="eager"` and
`fetchpriority="high"`. On mobile the portrait is a 56 px avatar, so the headline is the LCP
and its fonts are preloaded. The aurora is a CSS radial gradient on a pseudo-element, never
a live `filter: blur()`. The proof block is one component with two layouts: a tile from `md`
up, a one-line row below it. The only motion on this screen is a single fade-up on load,
disabled under reduced motion.

## S — Structure

```
src/content.config.ts             collection `site` (file loader over src/content/site/*.yaml)
src/content/site/en.yaml          hero and metrics
src/assets/portrait.jpg           the source photo, cropped above the strap
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
   sparkles | menu | copy | check`; renders a 24-viewBox SVG using `currentColor`, with a
   `size` prop and `aria-hidden="true"`.
3. **`StatusChip.astro`**: pill with the live dot (signal fill with a soft glow) and a
   `label-mono` label; Figma `2:93`.
4. **`Button.astro`**: renders `<a>` when `href` is set, otherwise `<button>`. Variants map to
   Figma `2:92`: primary = signal fill with on-signal text; secondary = raised fill with a
   strong border; ghost = muted text. Optional leading icon; pass-through `download` and
   `data-track`.
5. **`MetricTile.astro`**: from `md` up a tile (surface, border, `radius-md`, source →
   value `metric-m` → caption); below `md` a row (value 22 px in a 142 px column, caption
   fills the rest, top border). Matches `2:98` and `9:197`.
6. **`Nav.astro`**: brand mark "jr" plus the name (the name hides below `md`), anchor links
   `#work`, `#open-source`, `#experience` from `md` up, the locale indicator, and a secondary
   "Email me" button (wired in 003). Mobile shows the menu icon, which opens a
   `<details>`-based sheet so it works without JavaScript.
7. **`Hero.astro`**:
   - left column: `StatusChip`, then `<h1>` with the lead in `display-xl` and the accent in a
     `<span class="display-serif text-signal">` on its own line; the lede in `body-l`
     (`max-width` 620 px); CTAs: primary "Download CV", secondary "Email me", ghost "See the
     work" linking to `#work`;
   - right column (`md` and up): the portrait at 420 × 540, radius 28, strong border, a
     bottom fade to canvas, two badge cards absolutely positioned (`-56/64` and `196/300`,
     as in Figma), and the location line inside the fade;
   - mobile: the avatar row (56 px circle, signal ring, name and "AI & Backend · Milan")
     above the headline; headline in `display-mobile` with the accent at 50 px;
   - the hero prompt slot below the columns, filled by the command palette in 002;
   - the aurora pseudo-element behind the prompt.
8. **`Proof.astro`**: grid of four `MetricTile` from `md` up (gap 20); below `md` the three
   featured metrics as rows.
9. **`pages/index.astro`**: `Base` layout with the English title and description; renders
   Nav, Hero and Proof, plus the sections from 002 and 003 as they land.
10. **Visual check**: screenshots at 390 × 844 and 1440 × 900 compared against the Figma
    frames. The mobile fold must end below the third proof row and above the contact bar.

## N — Norms

All of [norms.md](norms.md). Content comes only from `site/en.yaml` and
`data/public-profile.json` (the name and city).

## S — Safeguards

- The portrait asset is cropped above the bag strap, as in Figma; it is not the raw selfie.
- The "Based in Milan" line never mentions visa status.
- The fold contains no element that needs JavaScript to be visible.
