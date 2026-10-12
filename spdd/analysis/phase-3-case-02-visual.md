# Analysis — Phase 3: Case visuals, case 02

Step 3 of the SPDD flow for story [017](../stories/017-see-where-the-money-went.md), approved on
2026-10-12. It reuses the decisions of the [case 03](phase-3-case-visuals.md) and
[case 01](phase-3-case-01-visual.md) analyses; this document covers only what case 02 adds.
Inputs: the six `Case 02 mechanism` frames and their copy (approved 2026-10-12, see
[../design.md](../design.md)), `CaseMechanism.astro`, the cases schema and
`src/content/cases/*/02-cost-leak.md`.

## 1. Diagnosis

| Piece | Today, after story 016 | What case 02 needs |
| ----- | ---------------------- | ------------------ |
| Case 02 body | `.md` in both languages; no `{` or `<` in the prose | `.mdx`, with `<Mechanism />` after Approach's first paragraph |
| Glyphs | Eight, from cases 03 and 01 | Four more: `ledger`, `trace`, `worker`, `drop` |
| Ties to the case | Dots to `before`, ticks to the rubric's detail, bars to the case's percentages | The drop glyph's bars must come from the case's amounts, `$15/day` (`$15/día`) and `$0` |
| Stepping, keyboard, live region, static version, page | Generic | Nothing new |
| Spanish review | Nested keys supported; diagram typography test for `%` | 13 rows for `02.mechanism.*`; no `%` in this copy |

## 2. Direction

### Decision 1 — The new glyphs and what draws their numbers

- **`ledger`:** three 12 px rows, the middle one outlined and lined in the `before` colour (the
  bucket without an owner). No amounts.
- **`trace`:** five 4 px dots in a row ending in a 12 px ring outlined in `before`. No path
  detail.
- **`worker`:** a 56 × 28 box outlined in `before` with three small bars fading 1, 0.7, 0.4. No
  name or calls.
- **`drop`:** the before bar drawn full in `before`, and under it an empty track whose fill is
  **`after ÷ before` of its width**, read from the case's metrics with a small parser
  (`$15/day` → 15, `$0` → 0); at 0 the fill is just the 8 px `signal` dot that marks zero, as in
  the frames. A `drop` stage in a case whose metrics are not two amounts, or where `after` is not
  below `before`, fails the build.

### Decision 2 — Where the checks live

- The schema's `superRefine` gains the `drop` rule; `src/lib/mechanism.ts` gains
  `amountOf(value)`, with tests for `$15/day`, `$15/día`, `$0`, `$12–16` (the first figure) and a
  value with no amount.

### Decision 3 — Copy and review

- The approved copy goes into each language's frontmatter; 13 Spanish review rows,
  `02.mechanism.*`, approved on 2026-10-12.

### Decision 4 — Checks

- The end-to-end run on case 02, with the glyphs' numbers (the drop's after fill at 0 % and its
  zero dot), and again on cases 01 and 03; screenshots against the six frames; the overflow audit
  at 12 widths; Lighthouse in CI with case 02's LCP and CLS against the last run.

## 3. Risks

| Risk | Mitigation |
| ---- | ---------- |
| `$` in the frontmatter or the body is read by MDX or YAML | `$` is not special in either; the build and the rendered body are compared with today's |
| A fill of 0 % looks like a missing drawing | The zero dot stays, as in the frames, and the step's sentence says "$0" |

## 4. Decisions

**✅ Decision 1 — The new glyphs.** Confirmed 2026-10-12: the four glyphs, with the drop's fill
read from the case's amounts.

**✅ Decision 2 — Where the checks live.** Confirmed 2026-10-12: the `drop` rule in the schema,
and `amountOf` with tests.

**✅ Decision 3 — Copy and review.** Confirmed 2026-10-12: copy in the frontmatter, and 13 review
rows.

**✅ Decision 4 — Checks.** Confirmed 2026-10-12: as listed.
