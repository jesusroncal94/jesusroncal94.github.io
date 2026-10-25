# 017 — See where the money went

Story: [017](../stories/017-see-where-the-money-went.md). Analysis:
[Phase 3, case 02](../analysis/phase-3-case-02-visual.md), on top of the
[case 03](../analysis/phase-3-case-visuals.md) and [case 01](../analysis/phase-3-case-01-visual.md)
analyses. Penpot, page Cases: `Case 02 mechanism — Desktop 1440 · step 1`, `· static`,
`· step 3 · es`, `Case 02 mechanism — Phone 390 · step 4`, `· static`, `· step 2 · es`
(see [../design.md](../design.md)).

**Status:** implemented on 2026-10-12; the story, the frames, the copy, decisions 1–4 and the
canvas start were approved that day. Published with #30. Done on 2026-10-12,
story 017 closed after the check on the published site.

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

## Sync — 2026-10-12 (operations 1–4)

This section is authoritative where it differs from the operations above.

- **Op 1** (`a9f3c19`). As written.
- **Op 2** (`cba1b58`). The amounts are read once per case, outside the loop over stages. The
  drop's fill keeps an 8 px minimum width, so the zero dot of the frames is always drawn. Against
  the published site (the state of `main` before this story), with the CSS file's name and the
  PostHog key normalised (CI injects the key; the local build leaves it empty): cases 01 and 03
  in both languages, case 04 and the home page are identical.
- **Op 3** (`98f681f`). The first insertion of the `<Mechanism />` tag matched the same sentence
  in the new frontmatter rather than in the body, which broke the YAML; the review and typography
  tests failed at once, and the tag was moved before "Stopping it once…" / "Pararlo una vez…".
  With `before: fifteen a day`, and with `after: $20`, the build fails with "A drop glyph draws
  the case's amounts…"; restored afterwards. Against the published site: case 02 differs only by
  the figure, its script and its styles; cases 01 and 03 are identical.

**Verified on 2026-10-12, on the production build:**
- End-to-end, Chromium, Firefox and WebKit, English and Spanish, 390 and 1440 px: **case 02,
  1,038 checks pass**, the story 015 run plus the drop glyph (fill styled `0%`, drawn as the 8 px
  signal dot, over the 84 px before bar); **case 01, 1,038, and case 03, 1,026, still pass.**
- Overflow: zero at all 12 widths on both case 02 pages, stepped and static.
- Keyboard rule of `norms.md`, both case 02 pages, 390 and 1440 px, three engines: 12 of 12.
- Screenshots of the six frames' states match them.
- Tests: 345 pass. Build checks: links, previews and structured data valid on 15 pages.
- **Lighthouse,** pull request #30, run `38283985441` (3 min 9 s), 15 URLs × 3: every
  assertion passes; all seven shards' assertion files are empty; every page has median
  performance 1 and accessibility 1, median LCP 1,355–1,363 ms, CLS at most 0.0049. **Case 02
  against pull request #28:** median LCP 1,361 against 1,357 ms in English and 1,360 against
  1,357 ms in Spanish; CLS 0.0010 and 0.0009 against the same values. The LCP element is still
  the first paragraph of Problem.

**Verified on the published site, 2026-10-12,** after #30 was merged (`5497e84`) and deployed
(run `38285225308`, 3 min 18 s), with analytics requests blocked: **case 02, 1,038 checks pass;
case 01, 1,038, and case 03, 1,026, still pass**, in Chromium, Firefox and WebKit, both
languages, 390 and 1440 px, stepped and static.

**Done when, item by item:** screenshots match the six frames; the `amountOf` tests pass and the
build fails on a drop without two amounts, the second below the first; the end-to-end run passes
on cases 02, 01 and 03 in the three engines, on the production build and on the published site;
case 02's body is unchanged apart from the diagram and cases 01 and 03 apart from the CSS file's
name; zero overflow at 12 widths on case 02; tests pass and Lighthouse passes in CI with case 02's
LCP and CLS unchanged. **Story 017 is closed.**

## Sync — 2026-10-26

The MindFortress role was re-verified against the work repositories on 2026-10-25 (`cv-manager`
`b1b133b`). The CV no longer claims the unattributed spend went "~$12-16/day to $0" or that $0 was
verified in the production ledger; it says the ~$16/day leak was root-caused to a stale staging
worker running against the production database, guarded in code, and that the production and
staging credentials were split. Case 02 follows it, in English and in Spanish:

- `before` is "~$16/day" and `after` "guarded" (ES "protegido"); the summary, the stages and the
  body say "a stale staging worker running against the production database", add the split
  credentials, and drop the ledger and every "$0". The result credits the team effort to
  attribute every LLM call to a user or project. The stack tag "Cost ledger" became "Railway".
- **The fourth stage uses the `gate` glyph instead of `drop`.** A drop draws the second amount
  below the first, which would show the $0 the case no longer claims. The `drop` glyph and its
  refine stay in the code, unused for now.

Approved by Jesus on 2026-10-26. The OG image's alt text reads "~$16/day to guarded" because the
shared template is "{before} to {after}"; left as it is. Checks are in the 2026-10-26 sync of
[canvas 019](019-one-cv-wherever-it-comes-from.md).
