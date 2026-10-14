# Analysis — Phase 1.10: See how it is built

Step 3 of the SPDD flow for story [021](../stories/021-see-how-it-is-built.md), approved on
2026-10-14. Inputs:
- the Penpot file **jesusroncal94.github.io · docs**, with pages Foundations, 01 SPDD process,
  02 Architecture and 03 Privacy boundary, and the boards `style-sheet`, `spdd-process`,
  `architecture` and `privacy-boundary`, approved on 2026-10-14;
- evidence-library's `docs/` (PRs #11 and #12 there): an entry page, process pages, a design
  README with a manifest, `postprocess-svg.sh` and the `update-diagram` skill;
- `src/lib/ci-scope.ts`, `tasks.ps1` and `compose.yaml`;
- the README.

## 1. Diagnosis

| Piece | Today | What the story needs |
| ----- | ----- | -------------------- |
| Documentation folder | None | `docs/`: an entry page, three pages each headed by its diagram, and a design page |
| Diagram source | — | The Penpot docs file, separate from the design file; a `.penpot` backup in the repository |
| Getting SVGs out of Penpot | — | The plugin cannot write to disk, so Jesus exports each board as SVG; the agent copies it in and post-processes it (as in evidence-library) |
| Post-processing | evidence-library uses a Bash and Perl script | Docker only here, so a Node script behind `./tasks.ps1` |
| Checks on the published diagrams | evidence-library has a link check only | Tests for manifest completeness, links from pages, no web font or script, token colours only |
| CI scope | `spdd/`, `README.md` and `CLAUDE.md` count as documentation only | `docs/` and `.claude/skills/` must too, or a docs change runs the 14 Lighthouse jobs for nothing |
| README | Says Figma three times; no link to docs | Penpot, and a link to `docs/` |
| Norms | Nothing ties diagrams to code | A change of process or architecture updates its page and diagram in the same pull request |

What a Penpot SVG export contains, seen in evidence-library's files: a single line, a
`<style>` block with `@font-face` rules that load the font from Penpot's servers, and text set in
the font family. Here the font family is Geist (a Google font in Penpot, `gfont-geist`) and Geist
Mono.

## 2. Direction

### Decision 1 — Structure

```
docs/
  README.md              entry: one paragraph, then the pages in reading order
  process.md             spdd-process.svg + numbered steps
  architecture.md        architecture.svg + the parts, in text
  privacy.md             privacy-boundary.svg + the rules
  design/README.md       manifest, visual language, how to update a diagram
  design/jesusroncal94-docs.penpot   backup of the Penpot file, exported by Jesus
  diagrams/*.svg         spdd-process, architecture, privacy-boundary, style-sheet
.claude/skills/update-diagram/SKILL.md
```

- **Text and diagram say the same thing.** Each page reads fully without its image, and the
  text is what a pull request review reads.
- **The style sheet is published too,** as the design page's legend.

### Decision 2 — Export and post-processing

- **Export:** Jesus exports each board from Penpot as SVG, named after the board, to Downloads,
  and the whole file as `.penpot` when the file's structure changes. The agent copies, never
  moves, the files into `docs/`.
- **`scripts/postprocess-svg.ts`,** run by a new task, `./tasks.ps1 diagrams`:
  - removes every `<style>` block that contains `@font-face`;
  - gives each font family system fallbacks: Geist → `'Segoe UI', Roboto, Helvetica, Arial,
    sans-serif`, Geist Mono → `ui-monospace, Consolas, monospace`;
  - is idempotent, so running it twice changes nothing.

### Decision 3 — Tests

`tests/docs.test.ts` reads the manifest table in `docs/design/README.md` and fails when:
- an SVG in `docs/diagrams/` is missing from the manifest, or a manifest row has no SVG;
- a diagram is linked from no Markdown page in `docs/`;
- an SVG contains `@font-face`, `<script` or a remote `url(`;
- an SVG uses a colour, in a `fill`, `stroke` or `stop-color`, that is not one of the
  `tokens.css` values, light or dark (`none` and `transparent` allowed);
- a relative link in any `docs/*.md` or the README points to a file that does not exist.

### Decision 4 — CI scope

`src/lib/ci-scope.ts` treats `docs/` and `.claude/skills/` as documentation, with its existing
test extended. The docs tests still run in the `site` job, so a docs-only pull request is still
checked, just without the Lighthouse jobs, which measure pages that did not change.

### Decision 5 — Page copy, README and norm

- **Pages:** the texts of the four pages are drafted and approved before they are committed,
  like any user-facing copy. They are in English and describe only the process, never the
  contents of `cv-manager`.
- **README:** "Figma" is replaced by Penpot, and it gains a link to `docs/`.
- **`norms.md`:** gains "A change of process or architecture updates its page and diagram in the
  same pull request."
- **The skill** records the procedure:
  - check that the connected Penpot file is the docs file;
  - keep the tab in front;
  - edit using the file's library;
  - review the export;
  - Jesus exports;
  - copy the files in, run `./tasks.ps1 diagrams`, update the manifest date, run the tests.

## 3. Risks

| Risk | Mitigation |
| ---- | ---------- |
| The diagram and the text drift apart | Same-PR norm; the text is what is reviewed; the manifest's export date shows when a diagram was last refreshed |
| Penpot's SVG uses colours outside the tokens (anti-aliasing, shadows, opacity) | The colour test names the colour and the file; the diagrams use no shadows or gradients. If Penpot writes opacity as a separate attribute, the base colour is still a token |
| Geist is not installed where the SVG is viewed | The system fallbacks keep the layout close; text stays text, so it is readable and searchable |
| The `.penpot` backup bloats the history | It is refreshed only when the file's structure changes, not for each edit |
| The export server times out on a cold Google font (seen on 2026-10-14) | Retrying worked within minutes; if Jesus's export from the UI times out too, it is retried the same way |

## 4. Decisions

**⚠️ Pending:** Decisions 1–5, as recommended above.
