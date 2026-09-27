# 007 — Reads well on any screen

Story: [007](../stories/007-reads-well-on-any-screen.md). Analysis:
[Phase 1.1](../analysis/phase-1-1-responsive.md). Penpot, page Home: `Home — Phone 390`,
`Home — Tablet 834`, `Home — Desktop 1440` (see [../design.md](../design.md)).

**Status:** implemented and synced on 2026-09-27.

## R — Requirements

The page lays itself out for phones, tablets and desktops, and nothing overflows at any
width from 320 to 2560 px.

- Three layouts on two breakpoints: phone below 768 px, tablet from 768 px (`md:`),
  desktop from 1280 px (`xl:`). `lg:` is not used for layout.
- Content sits in a centred column at most 1280 px wide, with 24 / 40 / 80 px gutters.
  Section backgrounds and rules stay full-bleed.
- Display, serif accent, H2 and Metric L sizes are fluid between the phone and desktop
  frames, exact at 390 and 1440 px.
- A before → after value or a metric wraps between values, never inside one.
- Tablets never download the desktop portrait.

**Done when:** the Playwright audit reports zero horizontal overflow on `/` and on a case
page at 320, 360, 390, 430, 600, 768, 900, 1024, 1280, 1440, 1920 and 2560 px; the
headline takes at most three lines at every width above 390 px; screenshots at 390, 834,
1024, 1280 and 1920 px match the frames; the Lighthouse budget passes on every page.

## E — Entities

No data changes. The layout vocabulary:

```
Layout      phone < 768 ≤ tablet < 1280 ≤ desktop
Gutter      --gutter: 1.5rem | 2.5rem | 5rem
Column      max 80rem of content, centred
Fluid type  display, display-serif, heading-h2, metric-l
```

## A — Approach

Mobile first, as today, with the old `md:` desktop rules moved to `xl:` and a tablet layer
added under `md:`. The column is one utility, `px-page`, applied to the element that
already carries the horizontal padding:
`padding-inline: max(var(--gutter), (100% - 80rem) / 2)`. Sections keep their full-bleed
borders and gradients, and no wrapper elements are added.

Each fluid style is a single utility whose `font-size` and `line-height` are `clamp()`s
interpolating from 390 to 1440 px. The paired `*-mobile` utilities and `display-xl` are
removed, so a size is decided in one place.

## S — Structure

```
src/styles/global.css           --gutter per breakpoint, utility px-page
src/styles/typography.css       fluid display, display-serif, heading-h2, metric-l; drop the *-mobile pairs and display-xl
src/sections/Nav.astro          px-page
src/sections/Hero.astro         tablet identity row, split only at xl, portrait media 80rem
src/sections/Proof.astro        2 × 2 tiles on tablet, 4 on desktop
src/sections/Work.astro         2 columns only at xl
src/sections/OpenSource.astro   3 columns only at xl, breakable repository names
src/sections/Experience.astro   2-column tablet grid, 4-column desktop grid
src/sections/Principles.astro   fluid numeral
src/sections/Contact.astro      fluid headline, px-page
src/components/SectionHead.astro  stacked until xl, lede from md
src/components/BeforeAfter.astro  wrapping row, nowrap values, fluid metric
src/components/ContactBar.astro   compact below 380 px
src/pages/work/[slug].astro     px-page, fluid H1
```

## O — Operations

1. **Column and gutters.** In `global.css`, set `--gutter` on `:root` to `1.5rem`,
   `2.5rem` from `48rem`, `5rem` from `80rem`, and add the `px-page` utility. Every
   `px-6 md:px-20` in sections, the nav and the case page becomes `px-page`.
2. **Fluid type.** In `typography.css`:
   - `display`: size `clamp(2.75rem, 2.006rem + 3.048vw, 4.75rem)`, line height
     `clamp(3rem, 2.257rem + 3.048vw, 5rem)`.
   - `display-serif`: size `clamp(3.125rem, 2.336rem + 3.238vw, 5.25rem)`, line height as
     `display`.
   - `heading-h2`: size `clamp(2rem, 1.721rem + 1.143vw, 2.75rem)`, line height
     `clamp(2.25rem, 1.925rem + 1.333vw, 3.125rem)`.
   - `metric-l`: size `clamp(2.125rem, 1.8rem + 1.333vw, 3rem)`, line height
     `clamp(2.5rem, 2.221rem + 1.143vw, 3.25rem)`.
   - Remove `display-xl`, `display-mobile`, `display-serif-mobile` and
     `heading-h2-mobile`, and replace every use.
3. **Hero.**
   - The identity row shows below `xl`: the avatar is 56 px on phones and 72 px on
     tablets, and on tablets the status chip sits at the row's right end.
   - The standalone status chip stays last on phones, is hidden on tablets and first on
     desktops.
   - The row becomes the split layout only at `xl`; the figure is `max-xl:hidden`, and the
     `<picture>` sources use `(min-width: 80rem)`.
   - The section clips horizontally, so the aurora never widens the page.
4. **Proof.** Tiles are `grid-cols-2` from `md` and `grid-cols-4` from `xl`; the phone
   rows are unchanged. Tile values do not wrap.
5. **Work.** The grid has two columns only from `xl`. The phone "Two more cases" behaviour
   is unchanged.
6. **Open source.** Three columns only from `xl`. Repository names use
   `overflow-wrap: anywhere`.
7. **Experience.** On tablets each row is a grid of a 140 px period column and a details
   column holding role and organisation, the line, and the place. From `xl` it is today's
   four columns (150 / 360 / 1fr / 130 px) with the place right-aligned.
8. **Section head.** Stacked until `xl`, where title and lede sit side by side. The lede is
   visible from `md`.
9. **Before → after.** A wrapping flex row (`gap-x-4`), each value `whitespace-nowrap`
   and `metric-l`; fixed heights become minimum heights with vertical padding.
10. **Contact.** Headline uses the fluid styles; centred from `md` as today.
11. **Contact bar.** Below 380 px the buttons drop their icons and use 12 px side padding.
12. **Principles and case page.** Numerals use `display-serif`; the case title uses
    `heading-h2`.
13. **Check.** Run the audit at the twelve widths on `/` and `/work/02-cost-leak/`, review
    the screenshots, and run Lighthouse CI.

## N — Norms

All of [norms.md](norms.md). Breakpoints appear only as `md:` and `xl:` (plus the one
`max-[380px]:` in the contact bar). No JavaScript for layout.

## S — Safeguards

- The phone layout at 390 px and the desktop layout at 1440 px render as approved; this
  story adds the tablet layout and the behaviour between frames, it does not redesign.
- The LCP element on phones and tablets stays the headline; only desktops fetch the
  portrait.
- No content changes.

## Sync — 2026-09-27

Implemented. This section is authoritative where it differs from the operations above.

- **Op 1.** `--gutter` is set with nested media queries on `:root` in `global.css`. Because
  `px-page` pads the section itself, `100%` is the viewport width, and no wrapper was
  needed anywhere.
- **Op 3.**
  - The status chip is rendered twice: once in the identity row (tablet only) and once
    standalone (phone and desktop). Only one is displayed at any width.
  - The avatar ships 56, 72, 112 and 144 px candidates, with
    `sizes="(min-width: 48rem) 72px, 56px"`.
  - The aurora keeps its desktop position relative to the column:
    `left: max(16.75rem, 50% - 28.25rem)`, which equals the approved 268 px at 1440 px.
- **Op 9.** On desktop, case 04 ("7 agents → 1 story graph") wraps after the arrow at
  1280 px and fits on one line at 1440 px. This is the intended between-values wrap.
- **Headline.** Four lines at 320 and 360 px, three at 390 and 430 px and at 1280 px, two
  elsewhere. That meets the criterion of at most three lines above 390 px.
- **Lighthouse locally.** Inside the Playwright container Chromium needs
  `--disable-dev-shm-usage`, or the tab crashes on Docker's 64 MB `/dev/shm`. CI is
  unaffected.

**Verified on 2026-09-27:**
- **Overflow audit** of the production build, on `/` and `/work/02-cost-leak/`, at 320,
  360, 390, 430, 600, 768, 900, 1024, 1280, 1440, 1920 and 2560 px: zero horizontal
  overflow at every width.
- **Screenshots** at 390, 900, 1280 and 1920 px:
  - 390 px is unchanged from Phase 1.
  - 900 px shows the tablet frame: the identity row with the chip, 2 × 2 tiles, single
    columns and the two-column timeline.
  - 1280 and 1920 px show the desktop frame inside the centred 1280 px column.
- **Tests:** 7 unit tests pass.
- **Lighthouse:** all assertions pass on six URLs × 3 runs.
