# 021 — See how it is built

Story: [021](../stories/021-see-how-it-is-built.md). Analysis:
[Phase 1.10](../analysis/phase-1-10-docs.md). Penpot: the file **jesusroncal94.github.io · docs**,
pages Foundations, 01 SPDD process, 02 Architecture and 03 Privacy boundary.

**Status:** implemented on 2026-10-14. The story, the four boards, decisions 1–5, the canvas start
and the texts of the five pages were approved that day. Published with #39. Done on 2026-10-14,
story 021 closed after the check on GitHub; the docs-only run is shown by this closing pull
request.

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

## Sync — 2026-10-14 (operations 1–4)

This section is authoritative where it differs from the operations above.

- **Penpot.** The docs file was created by Jesus. On the first two connections the plugin
  answered from **evidence-library · docs**; nothing was changed there, and work started only
  once the connected file's name was right. The file holds:
  - a library of the 12 Piedra light tokens and five Geist typographies;
  - the boards `style-sheet`, `spdd-process`, `architecture` and `privacy-boundary`.
  
  Nine layout fixes were made from PNG exports before approval: centred gate labels, shorter
  subtitles, orthogonal arrows, an overlapping zone label, and two awkward line breaks. The
  export server timed out on the cold Google font Geist a few times, and retrying worked.
- **Op 1** (`3d64fce`).
  - `src/lib/svg.ts`:
    - `postprocessSvg` removes `@font-face` style blocks and keeps the others;
    - it gives Geist and Geist Mono system fallbacks, in CSS and in attributes, including
      `&quot;`-escaped names;
    - running it twice changes nothing.
  - `svgColours` normalises hex and `rgb()` colours.
  - `./tasks.ps1 diagrams` is backed by a `diagrams` compose service and npm script.
  - `ci-scope` counts `docs/` and `.claude/skills/` as documentation, but not
    `.claude/settings.json`.
  - 6 new tests.
- **Ops 2 and 3, one group** (`4f3dd50`, `3857669`, `073b637`, `90c30e0`). The docs test can
  only pass once the pages exist, so the diagrams, the test and the pages went in together.
  - **Downloads** held two `architecture` SVGs. Ours was `architecture (1).svg`, told apart by
    its title text; the other is evidence-library's. The skill now says to check content before
    copying.
  - **Penpot's SVGs:**
    - each is one line, 35–101 KB after post-processing;
    - text sits in `style` attributes as `font-family: Geist;`;
    - colours are `rgb()`;
    - each `<text>` carries `textLength` with `lengthAdjust="spacingAndGlyphs"`, so fallback
      fonts keep Geist's widths.
  - **The two `diagrams` runs:** the first reported every file processed, the second every file
    unchanged.
  - **Colours:** all 9–12 colours of each SVG are tokens.
  - **The README:** "Figma" was not the only stale claim. It also said Spanish was unpublished,
    the site dark only, and Lighthouse a single pass. All four were brought up to date, and it
    links `docs/` and lists `./tasks.ps1 diagrams`.
  - **The skill:** `.claude/` was excluded locally (`.git/info/exclude`), so the skill was
    missing from its commit. The local exclude now ignores `.claude/*` except
    `.claude/skills/`, so `settings.local.json` stays ignored, and the skill went in its own
    commit.

**Verified on 2026-10-14:**
- Tests: 419 pass, 11 of them from `tests/docs.test.ts`.
- The failure cases fail, in one run, and were restored afterwards. An extra SVG carried no
  manifest row, an `@font-face` and the colour `#ff00ff`, and the privacy page lost its image.
  Four tests failed:
  - manifest completeness;
  - "shows every diagram on its page";
  - "no web font, script or remote resource";
  - "token colours only".
- Each SVG was rendered as an image on a light and a dark page, offline and without Geist
  installed. Each renders at 1,280 px with the fallback fonts, matches its board, and keeps its
  own background, so it reads the same on GitHub in either mode.
- Relative links in `docs/` and the README resolve (the docs test).
- **CI, #39.** The pull request changed code (`ci-scope.ts`, `svg.ts`, `package.json`), so it ran
  in full. After the fix below, `site`, the 14 Lighthouse jobs and `build` pass.
  - Squash-merged as `e80acda`.
  - Deployed in 4 min 31 s (run `38600330049`). The site's pages are unchanged by this story.
- **On GitHub:** all 11 files are on `main`: the five pages, the four SVGs, the `.penpot` backup
  and the skill. `docs/process.md` renders with its diagram in GitHub's dark mode.
- **The docs-only path** is shown by the closing pull request, which touches only `spdd/`: CI
  should run `site` and skip Lighthouse.

**First CI run of #39 failed** (`site`: 3 docs tests). `docs/design/README.md` and the `.penpot`
backup had never been committed: `.gitignore`'s `design/`, meant for the local `design/` folder
at the root, matched `docs/design/` too. Locally the files existed on disk, so every test passed.
The rule is now `/design/`, anchored to the root, and the two files are committed. Before a push,
`git status --short -uall` and `git check-ignore` on new folders show what would be left out.

**Done when, item by item:**
- `./tasks.ps1 diagrams` processes the exports, and a second run changes nothing.
- `tests/docs.test.ts` passes, and its four failure cases fail.
- `isDocumentationOnly` covers `docs/` and `.claude/skills/`, with tests.
- The SVGs render offline, without Geist, on light and dark pages, and on GitHub.
- The pages, the README and the norm are in, with the page copy approved.
- The skill describes the procedure.
- CI passes; the docs-only skip is shown by the closing pull request.

**Story 021 is closed.**
