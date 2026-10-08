# 014 — Know where I am

Story: [014](../stories/014-know-where-i-am.md). Analysis:
[Phase 1.7](../analysis/phase-1-7-active-section.md). Penpot, page Home:
`Home — Desktop 1440 · active section`, `Home — Tablet 834 · active section`,
`Home — Phone 390 · menu active section` (see [../design.md](../design.md)).

**Status:** written on 2026-10-08; the story, the frames and decisions 1–5 were approved that
day. Waiting for the start.

## R — Requirements

On the home page, the bar marks the link to the section being read, and only that one, in the
desktop row and in the phone menu; nothing is marked anywhere else.

- The section being read is the one crossing a line one pixel under the bar; in a block the
  bar does not link, nothing is marked.
- The mark is `aria-current="location"`, primary text and a 2 px signal line under the word;
  in the phone menu also the raised background.
- Without JavaScript, or on pages without the sections, the bar is exactly today's.

**Done when:**
- Screenshots match the three frames.
- The unit tests for `currentSection` pass.
- The end-to-end run passes, in both languages at 390 px (menu open) and 1440 px: the marked
  link for every block, none on the hero, the proof strip, How I work and Contact; the right
  link right after a jump from each bar link and from a `#fragment` URL; nothing marked on a
  case page; nothing marked and nothing changed with scripts disabled.
- Overflow is zero at all 12 widths on `/` and a case page.
- Tests pass, and the Lighthouse budget passes in CI.

## E — Entities

```ts
// src/lib/active-section.ts
interface SectionBox { id: string; top: number; bottom: number }  // viewport coordinates
currentSection(line: number, sections: SectionBox[]): string | undefined
// the id whose box contains the line (top <= line < bottom), else undefined
```

```html
<!-- Nav.astro, each section link, both copies -->
<a href="/#work" data-section-link aria-current="location">…</a>
```

## A — Approach

Decisions 1–5 of the analysis.

1. **Measure, then decide in a pure function.** The script reads the bar's bottom edge and the
   linked sections' boxes; `currentSection` picks the id. The rule is unit-tested without a
   browser.
2. **One attribute drives everything.** The script only sets or removes `aria-current`; the
   look comes from Tailwind's `aria-[current=location]:` variants, so the announced state and
   the visible state cannot differ.
3. **Nothing to do, nothing done.** Links whose page is not this one, or whose target is
   missing, are ignored; if none is left, the script returns before adding any listener.

## S — Structure

```
src/lib/active-section.ts       currentSection
tests/active-section.test.ts    the blocks, the boundaries, outside the linked sections
src/sections/Nav.astro          data-section-link, the mark's classes, the script import
src/scripts/active-section.ts   measures, applies aria-current; scroll, resize, hashchange
```

## O — Operations

1. **`currentSection`.** As in the entities. Tests: the line in each of three sections; on the
   exact top edge (current) and the exact bottom edge (next one, or none); above the first and
   below the last (none); a gap between sections (none); an empty list (none).
2. **The mark in `Nav.astro`.**
   - Both copies of each section link get `data-section-link`.
   - **Row:** the link wraps its label in a `relative` span whose `::after` is the line:
     `absolute inset-x-0 top-full mt-1.5 h-0.5 rounded-full bg-signal`, hidden by default and
     shown under `aria-[current=location]`. The link adds `aria-[current=location]:text-primary`,
     and `transition-colors` becomes `motion-safe:transition-colors`.
   - **Menu:** the same span and line; the link adds `aria-[current=location]:bg-raised`.
   - Check: with no `aria-current` anywhere, the bar is pixel for pixel today's at 390 and
     1440 px; with one set by hand, it matches the frames.
3. **The script.** `src/scripts/active-section.ts`, imported from the existing script in
   `Nav.astro`.
   - Collects `[data-section-link]` whose `pathname` equals `location.pathname` and whose hash
     names an element; stops if none.
   - `update()`: `line = header.getBoundingClientRect().bottom + 1`; boxes of the distinct
     targets; `id = currentSection(line, boxes)`; sets `aria-current="location"` on every link
     to `#id` and removes it from the rest, touching the DOM only when the id changes.
   - Runs once at load, then on `scroll` (passive) and `resize` through one
     `requestAnimationFrame`, and on `hashchange`.
4. **Check,** on the production build.
   - The end-to-end run in the Done-when list.
   - Screenshots against the three frames.
   - The overflow audit, 12 widths, `/` and `/work/02-cost-leak/`.
   - Tests, link, preview and structured data checks; Lighthouse in the pull request's CI.

## N — Norms

All of [norms.md](norms.md). In particular:
- "Works without JavaScript": without the script no link carries `aria-current`, and the bar is
  today's.
- "Tokens, never literals": `text-primary`, `bg-signal`, `bg-raised`.
- "Motion respects prefers-reduced-motion": the colour change is `motion-safe:` only; the line
  appears without a transition.
- "Tests cover the happy path", plus the boundaries the rule depends on.

## S — Safeguards

- No layout shift: the line is an absolutely positioned pseudo-element.
- No request, no dependency, no new copy; one small script that does nothing off the home page.
- English and Spanish pages behave the same.
- Accessibility stays at 100 in the budget.
