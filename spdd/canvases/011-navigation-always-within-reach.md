# 011 — Navigation always within reach

Story: [011](../stories/011-navigation-always-within-reach.md). Analysis:
[Phase 1.4](../analysis/phase-1-4-sticky-nav.md). Penpot, page Home:
`Home — Desktop 1440 · scrolled`, `Home — Tablet 834 · scrolled`, `Home — Phone 390 · scrolled`,
`Home — Phone 390 · menu scrolled` (see [../design.md](../design.md)).

**Status:** implemented on 2026-10-05; the story, the frames (solid background), decisions 1–5
and the canvas start, with its amendment to decision 4, were approved that day. Synced below;
waiting for the pull request.

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

## Sync — 2026-10-05 (operations 1–4)

This section is authoritative where it differs from the operations above.

- **Op 1** (`d1921f6`).
  - The minifier first merged the scroll-driven longhands into `animation: linear both
    nav-scrolled scroll(root)`. The `animation` shorthand does not accept a scroll timeline,
    so browsers dropped the whole declaration and the line never appeared. The rule is now
    written as separate longhands with no shorthand (`animation-name`, `-timing-function`,
    `-fill-mode`, `-timeline`, `-range`), and the built CSS keeps them separate.
  - Checked at 390, 834 and 1440 px on `/`, `/work/02-cost-leak/` and `/es/privacy/`, with
    scripts on and off (18 cases): the bar is `sticky`, stays at `top: 0` at 400 px, 1500 px
    and the end of the page; it is 64 / 86 px tall and `main` starts right below it, as
    before; the line is transparent at the top and `rgb(38, 38, 44)` (the border token) once
    scrolled.
- **Op 2** (`08bc211`). `<html>` carries `scroll-pt-16 max-md:scroll-pb-21 md:scroll-pt-21.5`;
  case headings `[&_h2]:scroll-mt-4`. 42 jumps, both locales, 390, 834 and 1440 px, to the five
  home sections and `#problem`, `#approach`, `#result`: 32 land exactly 16 px below the bar; the
  other 10 are at the end of the page (`#contact` everywhere, `#result` from 834 px), where the
  page cannot scroll further and the target sits lower, fully visible. None is under the bar.
- **Op 3** (`476e289`). The card gets `data-suggestion-card` and `data-away:invisible`;
  `hideCardWhileScrolled` in `locale.ts` toggles `data-away` on a passive scroll listener.
  - At 1440 px with a Spanish browser, on `/` and a case: the card shows at 73 px, right-aligned
    with the switcher (the `· i18n` frame draws it at 76 px), is hidden after scrolling 600 px,
    is back at the top, and stays away once dismissed. Its position classes are unchanged
    from before the canvas. The check first flagged it, because it expected the card below
    80 px; that expectation was wrong, not the card.
  - At 390 px the pill stays in the pinned bar, 16 px from the top, after scrolling 900 px.
- **Commits.** One per operation.

**Verified on 2026-10-05, on the production build:**
- **Focus.** Tabbing through `/`, `/es/`, `/work/02-cost-leak/` and `/es/work/02-cost-leak/` at
  390 and 1440 px, 110–116 stops each: no focused element under the nav bar.
  - At 390 px on the home pages, measuring right after each Tab flagged the last link, "Built
    spec-first with SPDD", as under the contact bar. That bar hides itself when the contact
    section enters the view, over a 300 ms transition. Measured 500 ms after each Tab, all
    114 stops pass in both locales, the bar hidden at the end. So Chromium honours scroll
    padding for focus, which the analysis left to this check; other engines were not tested.
- **Phone menu.** Opened at 2,000 px: the sheet starts at 64 px, right under the bar, and its
  links are reachable; "Experience" closes it and lands 16 px below the bar.
- **Screen left for content** at 390 × 844 on a case page: from 64 to 760 px, **82.5 %**.
- **Overflow:** zero on `/`, `/work/02-cost-leak/`, `/es/` and `/es/work/02-cost-leak/` at all
  12 widths, at the top and scrolled 1,500 px, with a Spanish and an English browser.
- **Screenshots** match the four frames. One visible difference: after a jump the section's own
  top border shows 16 px below the bar's line, so two lines appear; the frames drew the section
  flush with the bar. The 16 px is decision 3's margin, the same gap the sections land at today.
- **Reduced motion:** the bar has no transition (`0s`).
- **Tests:** 273 pass. **Build checks:** "none broken" on 14 pages, every preview complete.
- **Lighthouse,** pull request #15, run `37377176279` (3 min 3 s), 14 URLs × 3: every assertion
  passes. Median LCP 1355–1361 ms, median CLS at most 0.005, every median performance score 1,
  accessibility 1, at most 1.8 KB of script per page. Three single runs scored under 1 on
  performance, the runner noise canvas 010 recorded; no median did.

**Found, outside this canvas:** the phone contact bar slides in and out with a 300 ms
`translate` and `opacity` transition that does not check `prefers-reduced-motion`, against the
norm "Motion respects prefers-reduced-motion" (canvas 003).
