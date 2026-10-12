# 017 — See where the money went

Story: [017](../stories/017-see-where-the-money-went.md). Analysis:
[Phase 3, case 02](../analysis/phase-3-case-02-visual.md), on top of the
[case 03](../analysis/phase-3-case-visuals.md) and [case 01](../analysis/phase-3-case-01-visual.md)
analyses. Penpot, page Cases: `Case 02 mechanism — Desktop 1440 · step 1`, `· static`,
`· step 3 · es`, `Case 02 mechanism — Phone 390 · step 4`, `· static`, `· step 2 · es`
(see [../design.md](../design.md)).

**Status:** written on 2026-10-12; the story, the frames, the copy and decisions 1–4 were
approved that day. Waiting for the start.

## R — Requirements

Case 02 shows its chain inside Approach, after the first paragraph, with the component and
behaviour of cases 01 and 03, and four glyphs of its own whose numbers come from the case.

**Done when:**
- Screenshots match the six frames.
- Unit tests pass for `amountOf`; the build fails on a `drop` stage in a case whose metrics are
  not two amounts with `after` below `before`.
- The end-to-end run passes on case 02, with the drop's fill at 0 % and its zero dot, and again
  on cases 01 and 03, in Chromium, Firefox and WebKit, both languages, 390 and 1440 px, stepped
  and static.
- Case 02's body is unchanged apart from the diagram; cases 01 and 03 unchanged apart from the
  CSS file's name.
- Overflow is zero at all 12 widths on case 02 in both languages.
- Tests pass; Lighthouse passes in CI, with case 02's LCP and CLS within the last run's range.

## E — Entities

```ts
// src/content.config.ts
glyph: … | 'ledger' | 'trace' | 'worker' | 'drop'
// superRefine, added: 'drop' needs amountOf(before) > 0, amountOf(after) defined and below it

// src/lib/mechanism.ts
amountOf(value: string): number | undefined   // "$15/day" → 15, "$0" → 0, "$12–16" → 12, "112 queued" → undefined
```

## A — Approach

Decisions 1–4 of the analysis: the same component, four more glyphs, and the drop's fill read
from the case's amounts.

## S — Structure

```
src/lib/mechanism.ts                     + amountOf
tests/mechanism.test.ts                  + amountOf
src/content.config.ts                    + four glyphs, + the drop rule
src/components/CaseMechanism.astro       + four glyphs
src/content/cases/{en,es}/02-cost-leak.mdx   renamed; frontmatter mechanism; <Mechanism />
spdd/reviews/004a-es.md                  + 13 rows
```

## O — Operations

1. **`amountOf`.** As in the entities, with tests for `$15/day`, `$15/día`, `$0`, `$12–16` and a
   value with no amount.
2. **Schema and glyphs.** The enum gains `ledger`, `trace`, `worker`, `drop`; the `superRefine`
   gains the drop rule. The component draws, in the 82 × 46 box: `ledger` three 12 px rows, the
   middle one outlined and lined in `before`; `trace` five 4 px dots 7 px apart and a 12 px ring
   in `before`; `worker` a 56 × 28 box outlined in `before` with three 4 × 12 bars fading 1, 0.7,
   0.4; `drop` an 8 px `before` bar at full width over an 8 px track outlined in `border-strong`,
   filled to `amountOf(after) ÷ amountOf(before)` and starting with an 8 px `signal` dot.
   Check: the build passes; cases 01 and 03 render as before.
3. **The content.** `02-cost-leak.md` becomes `.mdx` in both languages, with the approved copy in
   its frontmatter and `<Mechanism />` after Approach's first paragraph; 13 review rows. Check:
   tests and build pass; case 02's body is unchanged apart from the diagram; a non-amount
   `before` fails the build.
4. **Check,** on the production build: the Done-when list.

## N — Norms

All of [norms.md](norms.md), in particular "Truthfulness": no number in the diagram that the
case does not state, and every drawn proportion read from the case.

## S — Safeguards

- No request, no new script, no runtime dependency.
- Cases 01 and 03 and the stepping behaviour are unchanged.
- English and Spanish behave the same.
