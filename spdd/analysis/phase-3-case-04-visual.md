# Analysis — Phase 3: Case visuals, case 04

Step 3 of the SPDD flow for story [018](../stories/018-see-the-hourglass.md), approved on
2026-10-13. It reuses the decisions of the [case 03](phase-3-case-visuals.md),
[case 01](phase-3-case-01-visual.md) and [case 02](phase-3-case-02-visual.md) analyses; this
document covers only what case 04 adds. Inputs: the six `Case 04 mechanism` frames and their
copy (approved 2026-10-13, see [../design.md](../design.md)), `CaseMechanism.astro`, the cases
schema and `src/content/cases/*/04-freya.md` as corrected on 2026-10-13 (#32).

## 1. Diagnosis

| Piece | Today, after story 017 | What case 04 needs |
| ----- | ---------------------- | ------------------ |
| Case 04 body | `.md` in both languages, with two lists since #32; no `{` or `<` in the prose | `.mdx`, with `<Mechanism />` in Approach |
| Glyphs | Twelve, from cases 03, 01 and 02; each draws its own stage | Four more, `channels`, `inbound`, `facts`, `outbound`, that each draw **the whole hourglass** and light their own part |
| Ties to the case | Dots, ticks, bars and fills read from the case | The segments of the channels row (4) and of the inbound and outbound rows (3 each) read from the stages' details |
| Stepping, keyboard, live region, static version, page | Generic | Nothing new |
| Spanish review | Nested keys supported | 13 rows for `04.mechanism.*` |

What the stepped version shows: one sentence at a time on screen, with all four kept in the page
for screen readers (`sr-only` list), and all four as a numbered list in the static version.

## 2. Direction

### Decision 1 — The new glyphs and what draws their numbers

- One drawing, seven 4 px rows 3 px apart in the 82 × 46 box, centred, widths 82, 58, 34, 10,
  34, 58 and 82 px: the hourglass. Unlit rows in `border-strong`.
- The top row is split into as many segments as the `channels` stage's detail states (4); the
  second row and the sixth into as many as the `inbound` and `outbound` details state (3 each).
  Segments are 4 px apart.
- **`channels`** lights the top row; **`inbound`** the second and third; **`facts`** the waist,
  in `signal`; **`outbound`** the fifth to seventh. Lit rows in `muted`.
- The counts are read once per case from the stages, so every card draws the same hourglass. A
  case with any of the four glyphs must have all four, once each, and the `channels`, `inbound`
  and `outbound` details must each state a count; otherwise the build fails.

### Decision 2 — Where the diagram goes, and the paragraph after it

- **Recommended: keep the case text as it is,** with the diagram after Approach's first
  paragraph, as in the frames and in cases 01–03. The paragraph after it tells the same chain in
  prose.
- The alternative raised with the frames was to let the diagram replace that paragraph. Against
  it: in the stepped version a sighted reader sees one sentence at a time, so the chain would only
  be readable by stepping through it, and the case would depend on the component for content it
  states today. The overlap is the same kind cases 01–03 already have between their prose and
  their steps.

### Decision 3 — Copy and review

- The approved stage copy goes into each language's frontmatter, with the diagram's accessible
  label, new copy to approve:
  - **EN:** "How the hourglass is shaped";
  - **ES:** "Cómo está formado el reloj de arena".
- 13 Spanish review rows, `04.mechanism.*`.
- `04-freya.md` becomes `.mdx` in both languages; its body is unchanged apart from the diagram.

### Decision 4 — Checks

- Unit tests for the hourglass rule.
- The end-to-end run on case 04: the segments 4, 3 and 3, the lit rows per step, the waist in
  `signal`. The run is repeated on cases 01–03.
- Screenshots against the six frames.
- The overflow audit at 12 widths.
- Lighthouse in CI, with case 04's LCP and CLS against #32's run.

## 3. Risks

| Risk | Mitigation |
| ---- | ---------- |
| The MDX conversion changes how the two lists or the quotes render | The rendered body is compared with today's published page, apart from the diagram |
| The 4 px rows read as decoration rather than a shape | The frames were approved at that size; the label and sentences carry the meaning, and the glyph is `aria-hidden` |
| A reader takes the hourglass for a diagram of the agents | No agent is drawn; the stages are the model's parts, and the case credits the platform to the team |

## 4. Decisions

**✅ Decision 1 — The new glyphs.** Confirmed 2026-10-13: four glyphs that each draw the whole
hourglass and light their part, with the segments read from the stages' details and the
all-four rule in the schema.

**✅ Decision 2 — Where the diagram goes.** Confirmed 2026-10-13: after Approach's first
paragraph, as in the frames; the case text is unchanged.

**✅ Decision 3 — Copy and review.** Confirmed 2026-10-13: copy in the frontmatter, the label
"How the hourglass is shaped" / "Cómo está formado el reloj de arena", and 13 review rows.

**✅ Decision 4 — Checks.** Confirmed 2026-10-13: as listed.
