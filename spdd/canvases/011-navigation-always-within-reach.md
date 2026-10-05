# 011 — Navigation always within reach

Story: [011](../stories/011-navigation-always-within-reach.md). Analysis:
[Phase 1.4](../analysis/phase-1-4-sticky-nav.md). Penpot, page Home:
`Home — Desktop 1440 · scrolled`, `Home — Tablet 834 · scrolled`, `Home — Phone 390 · scrolled`,
`Home — Phone 390 · menu scrolled` (see [../design.md](../design.md)).

**Status:** written on 2026-10-05; the story, the frames (solid background) and decisions 1–5
were approved that day. Waiting for the start.

## R — Requirements

The navigation bar stays at the top of the viewport on every page that has it, and nothing it
covers is lost.

- The bar is pinned at every width from 320 to 2560 px, in both locales, on home, case and
  privacy pages, with or without JavaScript.
- Its background is solid; a one-pixel line appears below it once the page has scrolled, where
  the browser supports scroll-driven animations.
- Section headings land below the bar after any jump, and focused elements are never under the
  bar, nor under the phone contact bar.
- The phone suggestion pill stays in the pinned bar; the desktop suggestion card does not
  follow the reader down the page.
- Nothing shifts: the bar takes the space it takes today.

**Done when:**
- Screenshots match the four frames.
- On 390 × 844 the two bars leave at least 80 % of the height for content.
- Overflow is zero at all 12 widths on `/` and a case page, in both locales.
- The end-to-end check passes: the bar stays at the top while scrolling; every home section and
  a case's `#result` land below it at 390, 834 and 1440 px; tabbing through a case page never
  leaves focus under either bar; the phone menu opened mid-page works.
- Tests pass, and the Lighthouse budget passes in CI.

## E — Entities

```css
/* src/styles/global.css */
@utility nav-pinned      /* sticky, top 0, solid canvas, and the line once scrolled */
@keyframes nav-scrolled  /* box-shadow line: transparent → border colour */
```

```html
<html class="scroll-pt-16 md:scroll-pt-21.5 max-md:scroll-pb-21">
```

## A — Approach

Decisions 1–5 of the analysis.

1. **CSS does the pinning.** `position: sticky` on the existing header keeps it in the flow.
2. **The line costs no space.** It is a `box-shadow` below the bar, not a border, so the bar's
   height stays 64 / 86 px and nothing moves by a pixel.
3. **One padding rule for every jump.** Scroll padding on `<html>` equals the bar's height per
   breakpoint; the sections' existing 16 px margin, and the same margin added to case
   headings, keep the distance a jump lands at today.
4. **The desktop card leaves when the reader does.** It stays in the header, so its position
   under the switcher is unchanged, and is hidden while the page is scrolled more than the
   bar's height, by the script that already shows it. At the top it is back, unless it was
   dismissed. This replaces moving it out of the header (decision 4's wording): placing it
   outside the header would need the switcher's position copied by hand, which shifts with
   the language of the "Email me" label.

## S — Structure

```
src/styles/global.css        + @utility nav-pinned, @keyframes nav-scrolled
src/sections/Nav.astro       header: nav-pinned (replaces relative)
src/layouts/Base.astro       <html> scroll padding classes
src/pages/[...locale]/work/[slug].astro   case h2: scroll-mt-4
src/scripts/locale.ts        the desktop card hides while scrolled
```

## O — Operations

1. **The pinned bar.**
   - `@utility nav-pinned`: `position: sticky; top: 0; background: var(--color-canvas)`, and,
     inside `@supports (animation-timeline: scroll())`, the animation `nav-scrolled` on the
     scroll timeline over the first 8 px, turning `box-shadow: 0 1px 0` from transparent to
     `var(--color-border)`.
   - The header's `relative` becomes `nav-pinned`; `z-20` stays, under the contact bar's
     `z-30`, which it never overlaps.
   - Check: the header's height is 64 / 86 px, as before; the bar stays at the top while
     scrolling; with scripts off it still does.
2. **Scroll padding.**
   - `<html>` gets `scroll-pt-16 md:scroll-pt-21.5` (64 / 86 px) and `max-md:scroll-pb-21`
     (84 px, the contact bar and its margin).
   - The case body's headings get `scroll-mt-4`, like the sections.
   - Check: each jump target's heading ends up 16 px below the bar.
3. **The desktop card while scrolled.**
   - `revealLocaleSuggestion` keeps the card; a passive scroll listener sets `data-away` on the
     card while `scrollY` is beyond the bar's height, and removes it at the top.
   - The card gets `data-away:invisible`. No transition, so nothing to reduce for motion.
   - The phone pill is untouched.
   - Check: at the top the card shows under the switcher, as in the `· i18n` frame; after a
     scroll it is gone; back at the top it returns; after dismissal it never returns.
4. **Check,** on the production build.
   - The end-to-end run in the Done-when list, at 390, 834 and 1440 px, both locales.
   - The overflow audit, 12 widths, `/` and `/work/02-cost-leak/`, both locales.
   - Screenshots against the four frames, plus the top of the page against the existing frames
     (no line, nothing moved).
   - Tests, link and preview checks; Lighthouse in the pull request's CI.

## N — Norms

All of [norms.md](norms.md). In particular:
- "Works without JavaScript": pinning and scroll padding are CSS; only the card's hiding uses
  the script that already exists, and without scripts the card is never shown at all.
- "Tokens, never literals": the canvas and border colours come from the tokens.
- "Motion respects prefers-reduced-motion": the line is a colour change bound to the first
  8 px of scroll, not motion, and the card appears and disappears without a transition.

## S — Safeguards

- No layout shift: the bar keeps its size, and the line is a shadow.
- No new request, script file or dependency; the card's listener lives in `locale.ts`.
- Accessibility stays at 100 in the budget, and focus is never obscured by either bar.
- English pages and Spanish pages behave the same.
