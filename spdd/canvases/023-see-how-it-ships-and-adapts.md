# 023 — See how it ships and adapts

Story: [023](../stories/023-see-how-it-ships-and-adapts.md). Analysis: none of its own; the
story reuses every decision of [Phase 1.10](../analysis/phase-1-10-docs.md) and needs no new
one. Penpot: the file **jesusroncal94.github.io · docs**, pages 04 CI pipeline, 05 Theme and
06 Languages.

**Status:** in progress. The story and the three boards were approved on 2026-10-15, and the
texts of the three pages the same day. The pages were written before this canvas existed; see
the incident below. The canvas start and the new norm were approved on 2026-10-15.

## R — Requirements

`docs/` gains three pages, each headed by a diagram from the docs Penpot file and saying the same
in text: the CI pipeline, the theme and the languages. The entry page, the architecture page and
the manifest point to them. The checks of story 021 cover the new diagrams with no new code.

**Done when:**
- `./tasks.ps1 diagrams` processes the three SVGs, and a second run changes nothing.
- `./tasks.ps1 test` passes, with `tests/docs.test.ts` covering the three new manifest rows.
- Each page states only what the code does, checked against the workflow, `lighthouserc.json`,
  `global.css`, the theme and locale code and the review tests.
- The entry page lists the pages in reading order, and the architecture page links each one.
- The `.penpot` backup holds the three new pages.
- Canvas 021 records that the docs-only path was proven on #40 and #42.
- CI passes and skips Lighthouse, since the change is documentation only.

## E — Entities

```
docs/design/README.md   manifest: + 04 CI pipeline, 05 Theme, 06 Languages
```

## A — Approach

The procedure of the `update-diagram` skill, unchanged: boards in the docs file, PNG review,
Jesus exports, `./tasks.ps1 diagrams`, manifest, pages. Every role, colour, arrow and typography
comes from the existing style sheet.

## S — Structure

```
docs/diagrams/ci-pipeline.svg, theme.svg, languages.svg   exported by Jesus
docs/design/jesusroncal94-docs.penpot                      refreshed
docs/ci.md, theme.md, languages.md                         new
docs/README.md, architecture.md, design/README.md          links and manifest
spdd/canvases/021-see-how-it-is-built.md                   the docs-only proof
```

## O — Operations

1. **Diagrams and pages.** Copy the exports, run `./tasks.ps1 diagrams` twice, write the three
   pages, update the entry page, the architecture page and the manifest, run the tests. One
   commit.
2. **Canvas 021.** Replace "should skip" with the proof from #40 and #42. A `docs(spdd)` commit
   with this canvas.

## N — Norms

[norms.md](norms.md), and the content rules of `docs/design/README.md`: English, the process and
the architecture only, never a personal detail or a key.

## S — Safeguards

- Check the connected Penpot file's name before any change, and the active page before creating
  a board.
- A diagram states only what the code does; read the code before drawing.

## Incident — 2026-10-15

- **The canvas came after the code.** The pages were written right after the boards were
  approved, skipping the analysis and the canvas-start gate. Nothing was committed or pushed.
  This canvas was then written and put to Jesus before any commit. New norm: nothing is
  written before its canvas is approved, documentation included.
- **A board was created on the wrong page.** The first `ci-pipeline` board landed on
  Foundations, over `style-sheet`, because the new page was not active yet. It was removed at
  once, and `style-sheet` was checked unchanged (1280×400 at 0,0). Boards are now created only
  after checking `penpot.currentPage`.
- **A node said more than the code.** The theme board said the preview cards carry
  `data-theme-pinned`; only the CV does. The board was corrected before publishing.
