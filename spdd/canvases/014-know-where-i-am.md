# 014 — Know where I am

Story: [014](../stories/014-know-where-i-am.md). Analysis:
[Phase 1.7](../analysis/phase-1-7-active-section.md). Penpot, page Home:
`Home — Desktop 1440 · active section`, `Home — Tablet 834 · active section`,
`Home — Phone 390 · menu active section` (see [../design.md](../design.md)).

**Status:** implemented on 2026-10-08; the story, the frames, decisions 1–5 and the canvas start
were approved that day, and so were the two focus fixes found on the way (see the Sync).
Published with #22. Done on 2026-10-08, story 014 closed after the check on the published site.

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

## Sync — 2026-10-08 (operations 1–4)

This section is authoritative where it differs from the operations above.

- **Op 1** (`05ac6ad`). As written; 3 tests.
- **Op 2** (`4594f60`). As written. The line is the `::after` of a `relative` span around the
  label, shown through `in-aria-[current=location]:after:block`. With no `aria-current`, five
  screenshots of the bar (desktop at the top and on Experience, tablet on Open source, the
  phone menu open, Spanish on Work) were byte-identical to the build before the change.
- **Op 3** (`247c55d`). One change to the rule: **each section's box is shifted up by its own
  scroll margin.** Sections carry `scroll-mt-4`, so a jump lands a section's top 16 px under
  the bar, not at it, as the analysis assumed; with the line one pixel under the bar, the first
  run marked the section above after every jump (44 of 105 checks failed). Shifted by the
  margin, the line falls where a jump puts the section's top. The script is inlined with the
  phone menu's handler, about 1 KB per page; no request.
- **Two focus defects found by the end-to-end run, fixed on this branch with Jesus's approval
  (2026-10-08):**
  - The pinned bar: focusing anything in it with the page scrolled moved the page
    (`7af12f2`). Recorded as an incident in [canvas 011](011-navigation-always-within-reach.md).
  - The phone contact bar: hidden, its links still took keyboard focus (`1625c43`). Recorded
    as an incident in [canvas 003](003-get-in-touch.md).
  - Two rules were added to [norms.md](norms.md).

**Verified on 2026-10-08, on the production build:**
- The end-to-end run, 105 checks, all pass:
  - `/` and `/es/` at 390, 834 and 1440 px: the marked link for every block, the hero, the
    proof strip, How I work and Contact, plus the end of the page; Work, Open source and
    Experience are marked, in both copies of the link, and nothing elsewhere.
  - Jumps from each link (from the menu at 390 px): the jumped-to link is marked, and the mark
    changes once, with no section in between.
  - A fresh load of `/#open-source` marks Open source.
  - Phone menu: the marked row has the raised background and a 2 px signal line. Desktop row:
    primary text and the line.
  - `/work/02-cost-leak/`, `/es/work/04-freya/`, `/privacy/` and a missing address, at the
    top, 600 px and the end: nothing marked.
  - Reduced motion: the link's transition is `0s`; without it, `0.15s`.
  - Scripts disabled: nothing marked, after a fragment jump either.
- Keyboard, Chromium, Firefox and WebKit, `/`, `/es/` and `/work/02-cost-leak/` at 390 and
  1440 px: tabbing forward and back never moves the page when focus enters the bar, never
  reaches the hidden contact bar, and leaves no focused element entirely hidden by a bar.
- Screenshots driven by the script match the three frames: desktop on Experience after a jump,
  tablet mid-way through Open source with Experience below (Open source marked), the phone menu
  open over Experience; and Spanish on Trabajo.
- Overflow: zero at all 12 widths on `/`, `/es/`, `/work/02-cost-leak/` and
  `/es/work/02-cost-leak/`, with a section marked.
- Tests: 293 pass. Build checks: 15 pages, links "none broken", previews "all complete",
  structured data "all valid".
- **Lighthouse,** pull request #22, run `37807928584` (3 min 12 s), 15 URLs × 3: every
  assertion passes; all seven shards' assertion files are empty. Every page has median
  performance 1, accessibility 1 and best practices 1, median LCP 1356–1362 ms, CLS at most
  0.005 and median TBT 0. Four English case pages show TBT 133–1274 ms on one run each: in
  every case the first run of its shard, with bootup 583–1977 ms against 63–85 ms on the
  other two runs, which have TBT 0. That is the runner's cold start, not the script, which
  returns at once on case pages; pull request #19 showed the same first-run pattern (313 and
  427 ms) before this change.

**Verified on the published site, 2026-10-08,** after #22 was merged (`98dcbaf`) and deployed
(run `37809251096`, 3 min 18 s), with a Playwright run whose analytics requests were blocked,
so it left no page views:
- `/` and `/es/` at 390 and 1440 px: nothing marked at the top and at the end; a jump to
  `#work`, `#open-source` and `#experience` marks exactly that link.
- At 390 px, at the end of the page, the hidden contact bar is `inert`.
- `/work/02-cost-leak/`, scrolled: nothing marked.
- Chromium and WebKit, 390 and 1440 px: focusing the menu button or a section link with the
  page at 3,000 px leaves it at 3,000 px.

**Done when, item by item:** screenshots match the three frames; the `currentSection` tests
pass; the end-to-end run passes in both languages at 390 (menu open) and 1440 px, plus 834,
for every block, every jump and a fragment URL, with nothing marked on a case page or without
scripts; zero overflow at all 12 widths on `/` and a case page; tests pass and Lighthouse
passes in CI. **Story 014 is closed.**
