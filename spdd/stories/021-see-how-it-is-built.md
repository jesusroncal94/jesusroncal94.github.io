# 021 — See how it is built

**As a** technical interviewer, or Jesus himself months from now, reading this repository
**I want** to see, in a few diagrams, how the site is built and how work moves through it
**So that** I understand the architecture and the process in about five minutes, without reading
twenty canvases

This story starts the repository's documentation, following the model of `evidence-library`
(process pages built around diagrams designed in Penpot), adapted to this repository: it is
public, and it has a design system of its own.

## Evidence (2026-10-14)

- **There is no documentation folder.** The process lives in `CLAUDE.md` (rules for agents), in
  `spdd/` (one artefact per story) and in the README's two tables. Nothing shows the whole in one
  picture.
- **The README is out of date.**
  - It says mockups are made in Figma; they have been made in Penpot since Phase 1.1.
  - It describes `src/styles/` as mirroring "the Figma variables".
- **The architecture is spread across 20 canvases.**
  - The data path: `cv-manager` → export → `data/` → build → PDFs and preview cards → Pages.
  - The CI pipeline, with its shards and light and dark passes.
  - The privacy boundary.
- **The privacy boundary has caused the most incidents:**
  - a real phone number and salary in a fixture (2026-09-24);
  - the case 04 attribution (2026-10-13);
  - a real phone number nearly committed in a test (2026-10-13).
  
  Its rules are written in `CLAUDE.md`, `norms.md` and two stories, but never drawn.
- **evidence-library solved the same need on 2026-10-14.** It uses:
  - an entry page;
  - one page per diagram, with numbered steps;
  - diagrams designed in a Penpot file of their own, with SVGs published to `docs/diagrams/`;
  - a manifest linking each board to its SVG;
  - a visual language in which colour means a role;
  - an SVG post-processing script;
  - an `update-diagram` skill.
  
  Nothing there checks that the published SVGs stay complete and consistent.
- **The design Penpot file is heavy.** Switching its theme stalled the browser tab twice on
  2026-10-13/14.

## Acceptance criteria

- WHEN a reader opens `docs/`
  THEN an entry page summarises the site and its process in one paragraph and lists the pages in
  reading order
- WHEN the reader opens the process, architecture or privacy page
  THEN a diagram heads it, and numbered steps or parts below say the same in text, so the page
  reads fully without the image
- WHEN a diagram uses colour
  THEN the colour means a role, drawn from the site's own tokens, and a legend on the design page
  says which
- WHEN the diagrams are viewed on GitHub, in light or dark mode, or offline
  THEN they render the same, with no web font or script inside
- WHEN a diagram is added, renamed, removed or exported again
  THEN the tests fail if any of these is true:
  - a published SVG is missing from the manifest, or a manifest entry has no SVG;
  - a diagram is linked from no page;
  - an SVG still carries a web font or a script;
  - an SVG uses a colour that is not a site token
- WHEN the documentation describes `cv-manager`
  THEN it shows only the boundary and what crosses it, never the repository's contents
- WHEN the README is read
  THEN it points to `docs/` and no longer says Figma

## Definition of done

- The three diagrams (process, architecture, privacy boundary) exist in a Penpot file of their
  own, separate from the design file, and are approved before the pages are written
- The page texts are approved
- The checks above run in `./tasks.ps1 test` and in CI
- An `update-diagram` skill records the procedure: connect to the right Penpot file, export,
  post-process, update the manifest
- The CI pipeline and the theme and language systems are left for a later story
