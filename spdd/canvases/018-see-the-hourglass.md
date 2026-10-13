# 018 — See the hourglass

Story: [018](../stories/018-see-the-hourglass.md). Analysis:
[Phase 3, case 04](../analysis/phase-3-case-04-visual.md), on top of the
[case 03](../analysis/phase-3-case-visuals.md), [case 01](../analysis/phase-3-case-01-visual.md)
and [case 02](../analysis/phase-3-case-02-visual.md) analyses. Penpot, page Cases:
`Case 04 mechanism — Desktop 1440 · step 1`, `· static`, `· step 3 · es`,
`Case 04 mechanism — Phone 390 · step 4`, `· static`, `· step 2 · es`
(see [../design.md](../design.md)).

**Status:** written on 2026-10-13; the story, the frames, the stage copy, decisions 1–4 and the
diagram's label were approved that day.

## R — Requirements

Case 04 shows the hourglass inside Approach, after the first paragraph, with the component and
behaviour of cases 01–03, and four glyphs of its own that each draw the whole hourglass and light
their part, with segment counts read from the case.

**Done when:**
- Screenshots match the six frames.
- Unit tests pass for `hourglassOf`; the build fails on a case with only some of the four
  hourglass glyphs, or whose `channels`, `inbound` or `outbound` detail states no count.
- The end-to-end run passes on case 04, with segments 4, 3 and 3, the lit rows of each step and
  the waist in `signal`, and again on cases 01–03, in Chromium, Firefox and WebKit, both
  languages, 390 and 1440 px, stepped and static.
- Case 04's body is unchanged apart from the diagram; cases 01–03 unchanged apart from the CSS
  file's name.
- Overflow is zero at all 12 widths on case 04 in both languages.
- Tests pass; Lighthouse passes in CI, with case 04's LCP and CLS within #32's range.

## E — Entities

```ts
// src/content.config.ts
glyph: … | 'channels' | 'inbound' | 'facts' | 'outbound'
// superRefine, added: any of the four needs all four, once each, and hourglassOf(stages) defined

// src/lib/mechanism.ts
HOURGLASS_PARTS = ['channels', 'inbound', 'facts', 'outbound']
HOURGLASS_ROWS = [82, 58, 34, 10, 34, 58, 82]          // px, the 4 px rows of the glyph
hourglassOf(stages): { channels, inbound, outbound } | undefined
// the leading count of each of the three stages' details; undefined if a stage or a count is missing
```

## A — Approach

Decisions 1–4 of the analysis: the same component, four more glyphs drawn from one hourglass
renderer, segment counts read from the case, and the case text unchanged.

## S — Structure

```
src/lib/mechanism.ts                     + HOURGLASS_PARTS, HOURGLASS_ROWS, hourglassOf
tests/mechanism.test.ts                  + hourglassOf
src/content.config.ts                    + four glyphs, + the hourglass rule
src/components/CaseMechanism.astro       + the hourglass renderer for the four glyphs
src/content/cases/{en,es}/04-freya.mdx   renamed; frontmatter mechanism; <Mechanism />
spdd/reviews/004a-es.md                  + 13 rows
```

## O — Operations

1. **`hourglassOf`.** As in the entities, with tests for the case's stages (4, 3, 3), a missing
   stage, and a detail without a count.
2. **Schema and glyphs.** The enum gains the four glyphs; the `superRefine` gains the hourglass
   rule. The component computes `hourglassOf(stages)` once and, for each of the four glyphs,
   draws in the 82 × 46 box seven 4 px rows 3 px apart, centred, with the widths of
   `HOURGLASS_ROWS`. Row 1 is split into `channels` segments, row 2 into `inbound` and row 6 into
   `outbound`, 4 px apart. Unlit rows are in `border-strong` and lit rows in `muted`, except the
   waist in `signal`. `channels` lights row 1, `inbound` rows 2–3, `facts` row 4, `outbound`
   rows 5–7. Check: the build passes; cases 01–03 render as before.
3. **The content.** `04-freya.md` becomes `.mdx` in both languages, with the approved copy and
   label in its frontmatter and `<Mechanism />` after Approach's first paragraph; 13 review rows.
   Check: tests and build pass; case 04's body is unchanged apart from the diagram; a case with
   three of the four glyphs fails the build.
4. **Check,** on the production build: the Done-when list.

## N — Norms

All of [norms.md](norms.md), in particular "Truthfulness": no number in the diagram that the
case does not state, every drawn count read from the case, and no part of the platform drawn as
Jesus's work.

## S — Safeguards

- No request, no new script, no runtime dependency.
- Cases 01–03 and the stepping behaviour are unchanged.
- English and Spanish behave the same.
