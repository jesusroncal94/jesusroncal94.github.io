# 021 — See how it is built

Story: [021](../stories/021-see-how-it-is-built.md). Analysis:
[Phase 1.10](../analysis/phase-1-10-docs.md). Penpot: the file **jesusroncal94.github.io · docs**,
pages Foundations, 01 SPDD process, 02 Architecture and 03 Privacy boundary.

**Status:** written on 2026-10-14. The story, the four boards and decisions 1–5 were approved that
day.

## R — Requirements

`docs/` explains the site and its process through three diagrams designed in the Penpot docs
file. Each diagram heads a page that says the same in text. The published SVGs carry no web font
or script and use only the site's tokens, and tests keep the manifest, the pages and the SVGs
consistent. Documentation changes skip the Lighthouse jobs.

**Done when:**
- `./tasks.ps1 diagrams` post-processes an exported SVG, and running it again changes nothing.
- `tests/docs.test.ts` passes. Removing a manifest row, unlinking a diagram, adding an
  `@font-face`, or using a colour that is not a token each make it fail.
- `isDocumentationOnly` is true for paths under `docs/` and `.claude/skills/`, with tests.
- The four SVGs render on GitHub in light and dark mode without Geist installed, matching the
  boards.
- The four pages, the README and the norm are in, with the page copy approved.
- The skill describes the whole procedure.
- Tests pass in CI, and the docs-only pull request skips Lighthouse.

## E — Entities

```
docs/design/README.md  manifest table: | Penpot page | Board | Published file | Used in | Exported |
scripts/postprocess-svg.ts   postprocessSvg(svg: string): string, and a CLI over docs/diagrams/*.svg
src/lib/svg.ts               postprocessSvg, svgColours(svg): string[]
src/lib/ci-scope.ts          + 'docs/', '.claude/skills/'
```

## A — Approach

Decisions 1–5 of the analysis.

## S — Structure

```
src/lib/svg.ts, scripts/postprocess-svg.ts, tests/svg.test.ts
tasks.ps1, compose.yaml               + diagrams
src/lib/ci-scope.ts, tests/ci-scope.test.ts
docs/diagrams/*.svg, docs/design/jesusroncal94-docs.penpot   exported by Jesus
docs/README.md, process.md, architecture.md, privacy.md, design/README.md
tests/docs.test.ts
README.md, spdd/canvases/norms.md, .claude/skills/update-diagram/SKILL.md
```

## O — Operations

1. **The pipeline.**
   - `postprocessSvg` with tests: removes `@font-face` blocks, adds the fallbacks, idempotent.
   - The CLI and the `diagrams` task.
   - `ci-scope` gains `docs/` and `.claude/skills/`, with tests.
   - Check: tests pass.
2. **The diagrams.**
   - Jesus exports the four boards as SVG, and the file as `.penpot`.
   - They are copied into `docs/` and post-processed.
   - The design page with its manifest, and `tests/docs.test.ts`.
   - Check:
     - the tests pass;
     - each of the failure cases in the Done-when list fails;
     - the SVGs open in a browser, matching the boards.
3. **The pages.**
   - The texts of the entry, process, architecture and privacy pages are drafted.
   - **Jesus approves them before commit.**
   - Then the pages, the README fix, the norm and the skill go in.
   - Check: tests, including the link check.
4. **Check:** the Done-when list, and in CI, a docs-only run.

## N — Norms

All of [norms.md](norms.md), in particular "Nothing private reaches the repository": the pages
and diagrams describe the boundary, never `cv-manager`'s contents.

## S — Safeguards

- No change to the site's pages, build output or budget.
- The design Penpot file is not touched, and the agent checks the connected file's name before
  any Penpot change.
