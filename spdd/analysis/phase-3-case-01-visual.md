# Analysis — Phase 3: Case visuals, case 01

Step 3 of the SPDD flow for story [016](../stories/016-see-how-a-prompt-ships.md), approved on
2026-10-10. It reuses the decisions of the [case 03 analysis](phase-3-case-visuals.md); this
document covers only what case 01 adds. Inputs: the six `Case 01 mechanism` frames and their
copy (approved 2026-10-10, see [../design.md](../design.md)), `CaseMechanism.astro`,
`src/scripts/mechanism.ts`, the cases schema and `src/content/cases/*/01-evals.md`.

## 1. Diagnosis

| Piece | Today, after story 015 | What case 01 needs |
| ----- | ---------------------- | ------------------ |
| Case 01 body | `.md` in both languages; English writes `## Approach`, Spanish `<h2 id>`; no `{` or `<` in the prose | `.mdx`, with `<Mechanism />` after Approach's first paragraph |
| Glyphs | `queue`, `lanes`, `gate`, `done` in the schema's enum and the component | Four more: `version`, `fixtures`, `rubric`, `compare` |
| Ties to the case | The 112-dot grid is checked against `before` | The rubric's 19 ticks and the compare bars' 45.6 % and 100 % must come from the case, not be typed into the component |
| Stepping, keyboard, live region, static version | Generic; the script and the CSS know nothing about case 03 | Nothing new |
| Case page | Already passes `locale` and the `Mechanism` mapping to every case's `<Content />` | Nothing new |
| Spanish review | Rows for UI keys and nested frontmatter keys; MDX tag lines ignored | 13 rows for `01.mechanism.*` |

## 2. Direction

### Decision 1 — The new glyphs and what draws their numbers

- **`version`:** three segments joined by two dots, the last in `signal`. No version number.
- **`fixtures`:** three sheet bars fading 1, 0.7, 0.4, each with a line inside. No count.
- **`rubric`:** one 2 px tick per rubric item. **The count is read from the stage's `detail`**
  ("19 items in 5 dimensions", "19 ítems en 5 dimensiones") with `leadingCount`, so the drawing
  shows exactly the number its approved copy states; a stage without a number fails the build.
- **`compare`:** two bars, the `before` colour over the `signal` colour. **Their widths are the
  case's `before` and `after` percentages** (45.6 % and 100 %), read with a small parser that
  accepts both `45.6%` and `45,6 %`; a `compare` stage in a case whose metrics are not two
  percentages fails the build.
- The alternative, numbers typed into the component or the frontmatter as separate fields,
  could drift from the copy the visitor reads.

### Decision 2 — Where the checks live

- The schema's refine, which already ties the dot grid to `before`, gains the two new rules:
  `rubric` needs a number in its `detail`; `compare` needs `before` and `after` to be
  percentages. One place, one error message each.
- `src/lib/mechanism.ts` gains `percentOf(value)`, with tests for `45.6%`, `45,6 %`, `100 %`
  and a value that is not a percentage.

### Decision 3 — Copy, typography and review

- The approved copy goes into each language's frontmatter; the Spanish percentages keep a
  non-breaking space before `%`, as the frames do, so "100 %" never splits across lines.
- 13 Spanish review rows, `01.mechanism.label` and the four stages' `label`, `detail` and
  `sentence`, marked approved on 2026-10-10.

### Decision 4 — Checks

- The story 015 end-to-end run, pointed at case 01 and at case 03, in the three engines, both
  languages, 390 and 1440 px; screenshots against the six frames; the overflow audit at 12
  widths; case 03 byte-identical in its body; Lighthouse in CI with case 01's LCP and CLS
  against the last run.

## 3. Risks

| Risk | Mitigation |
| ---- | ---------- |
| The Spanish non-breaking space is lost in an edit | The review test compares the shipped copy with the approved row; the frames show the line break it avoids |
| MDX treats `%` or `→` differently | Neither is special in MDX; the build and the rendered body are compared with today's |
| The new glyphs widen a card | They fit the 82 × 46 box; the overflow audit checks every width |

## 4. Decisions

**⚠️ Pending:** Decision 1 — the four glyphs, with the rubric's count read from its detail and
the bars' widths from the case's percentages.

**⚠️ Pending:** Decision 2 — the checks in the schema's refine, and `percentOf` with tests.

**⚠️ Pending:** Decision 3 — copy in the frontmatter with the non-breaking space, and 13 review
rows.

**⚠️ Pending:** Decision 4 — the checks as listed.
