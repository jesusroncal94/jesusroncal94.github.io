# 016 — See how a prompt ships

Story: [016](../stories/016-see-how-a-prompt-ships.md). Analysis:
[Phase 3, case 01](../analysis/phase-3-case-01-visual.md), on top of the
[case 03 analysis](../analysis/phase-3-case-visuals.md). Penpot, page Cases:
`Case 01 mechanism — Desktop 1440 · step 3`, `· static`, `· step 3 · es`,
`Case 01 mechanism — Phone 390 · step 4`, `· static`, `· step 2 · es`
(see [../design.md](../design.md)).

**Status:** implemented on 2026-10-11; the story, the frames, the copy and decisions 1–4 were
approved on 2026-10-10, and the canvas start on 2026-10-11. Synced below; Lighthouse passed in
the pull request's CI (#28); waiting for the merge.

## R — Requirements

Case 01 shows its eval loop inside Approach, after the first paragraph, with the component and
behaviour of case 03, and four glyphs of its own whose numbers come from the case.

**Done when:**
- Screenshots match the six frames.
- Unit tests pass for `percentOf`; the build fails on a `rubric` stage without a number and on a
  `compare` stage in a case whose metrics are not percentages.
- The story 015 end-to-end run passes on case 01 and on case 03, in Chromium, Firefox and
  WebKit, both languages, 390 and 1440 px, scripted and static.
- Case 01's body is unchanged apart from the diagram; case 03's page is unchanged apart from the
  component's shared styles.
- Overflow is zero at all 12 widths on case 01 in both languages.
- Tests pass; Lighthouse passes in CI, with case 01's LCP and CLS within the last run's range.

## E — Entities

```ts
// src/content.config.ts
glyph: 'queue' | 'lanes' | 'gate' | 'done' | 'version' | 'fixtures' | 'rubric' | 'compare'
// refine, added: 'rubric' needs leadingCount(detail); 'compare' needs percentOf(before) and
// percentOf(after)

// src/lib/mechanism.ts
percentOf(value: string): number | undefined   // "45.6%" → 45.6, "45,6 %" → 45.6, "112 queued" → undefined
```

```astro
<!-- CaseMechanism.astro gains: -->
before?: string; after?: string   // the case's metrics, for 'compare'
```

## A — Approach

Decisions 1–4 of the analysis.

1. **Numbers come from the copy.** The rubric draws as many ticks as its detail states; the
   compare bars are as wide as the case's percentages. The schema refuses a case where either
   cannot be read.
2. **Same component, more glyphs.** The stepping, keyboard, live region and static version are
   untouched.

## S — Structure

```
src/lib/mechanism.ts                    + percentOf
tests/mechanism.test.ts                 + percentOf
src/content.config.ts                   + four glyphs, + two refine rules
src/components/CaseMechanism.astro      + four glyphs, + before/after props
src/content/cases/{en,es}/01-evals.mdx  renamed; frontmatter mechanism; <Mechanism />
spdd/reviews/004a-es.md                 + 13 rows
```

## O — Operations

1. **`percentOf`.** As in the entities, with tests for `45.6%`, `45,6 %`, `100 %`, `100%` and a
   value that is not a percentage.
2. **Schema and glyphs.**
   - The enum gains `version`, `fixtures`, `rubric`, `compare`; the refine gains the two rules.
   - The component takes `before` and `after`, and draws the four glyphs in the 82 × 46 box:
     `version` three 22 × 14 segments with two 3 px dots, the last segment `signal`; `fixtures`
     three 12 px sheets fading 1, 0.7, 0.4, each with a 40 × 2 line; `rubric`
     `leadingCount(detail)` ticks 2 × 22 px, 2 px apart, in `signal`; `compare` a `before` bar
     at `percentOf(before)` % and a `signal` bar at `percentOf(after)` %, 8 px tall, 8 px
     apart.
   - Check: the build passes; case 03 renders as before.
3. **The content.**
   - `01-evals.md` becomes `.mdx` in both languages, with the approved copy in its
     frontmatter, the Spanish percentages with a non-breaking space, and
     `<Mechanism {...frontmatter.mechanism} before={frontmatter.before} after={frontmatter.after} locale={props.locale} />`
     after Approach's first paragraph.
   - 13 rows in `spdd/reviews/004a-es.md`.
   - Check: tests and build pass; case 01's body is unchanged apart from the diagram; a
     `rubric` detail without a number and a non-percentage `before` each fail the build.
4. **Check,** on the production build: the Done-when list.

## N — Norms

All of [norms.md](norms.md), in particular "Truthfulness": no number in the diagram that the
case does not state, and every drawn number read from the case.

## S — Safeguards

- No request, no new script, no runtime dependency.
- Case 03 and the stepping behaviour are unchanged.
- English and Spanish behave the same.

## Sync — 2026-10-11 (operations 1–4)

This section is authoritative where it differs from the operations above.

- **Op 1** (`82ca1a7`). As written; `percentOf` accepts a plain or a non-breaking space before
  `%`.
- **Op 2** (`3c456f4`). The schema's `refine` became a `superRefine` with one message per rule.
  Against the build before it, all 15 pages were identical apart from the CSS file's name; the
  CSS only gained the new glyphs' utilities.
- **Op 3** (`9441b62`).
  - The editor turned the non-breaking spaces of the Spanish frontmatter into plain ones; they
    were written as bytes, and the file keeps no BOM.
  - **A correction to the analysis:** its risk table said the review test would catch a lost
    non-breaking space. It would not: that test normalises whitespace, and `\s` covers the
    non-breaking space. `tests/case-typography.test.ts` now requires a non-breaking space before
    `%` in every Spanish diagram line; it passes as shipped and fails with a plain space.
  - With a `rubric` detail of "items in dimensions" the build fails with "A rubric glyph draws
    one tick per item…"; with `before: about half`, with "A compare glyph draws the case's
    percentages…". Restored afterwards.
  - Against the build before it: case 01 differs only by the figure, its script and its styles;
    case 03 only by the CSS file's name.

**Verified on 2026-10-11, on the production build:**
- End-to-end, Chromium, Firefox and WebKit, English and Spanish, 390 and 1440 px: **case 01,
  1,038 checks pass**, the story 015 run plus the glyphs' numbers (19 ticks; bars at 45.6 % and
  100 % of the glyph's width); **case 03, 1,026 checks still pass.**
- Overflow: zero at all 12 widths on both case 01 pages, stepped and static.
- Keyboard rule of `norms.md`, both case 01 pages, 390 and 1440 px, three engines: all pass.
- Screenshots of the six frames' states match them. The page shows Approach's whole first
  paragraph, which the frames abbreviate; in the browser the cards' Code Mono runs slightly
  wider than in Penpot, so "19 items in 5 / dimensions" breaks one word later than in the
  frame, with no number left alone; "100 %" stays whole in Spanish.
- Tests: 330 pass. Build checks: links, previews and structured data valid on 15 pages.
- **Lighthouse,** pull request #28, run `38178527534` (3 min 19 s), 15 URLs × 3: every
  assertion passes; all seven shards' assertion files are empty; every page has median
  performance 1 and accessibility 1, median LCP 1,355–1,361 ms, CLS at most 0.0055. **Case 01
  against pull request #27:** LCP 1266/1358/1359 ms against 1243/1359/1360 in English and
  1358/1359/1359 against 1355/1356/1356 in Spanish; CLS 0.0036–0.0045 against 0.0036–0.0038
  in English and 0.0041–0.0055 against 0.0043–0.0048 in Spanish, within run-to-run noise and
  far under the budget. The LCP element is still the first paragraph of Problem.
