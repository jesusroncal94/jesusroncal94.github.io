---
name: update-diagram
description: Create or change a diagram of jesusroncal94.github.io in Penpot and publish it to docs/diagrams/ with the manifest updated. Use when Jesus asks to add, fix, redraw or update a diagram, or when a change to the process or the architecture makes a page in docs/ out of date.
---

# update-diagram

Penpot is the source of the diagrams; the repository keeps the published SVGs and a backup of the
Penpot file. Read `docs/design/README.md` first for the visual language and the manifest.

## 1. Check the connection before touching anything

1. Run `penpot.currentFile.name` through the Penpot MCP. It must be
   **jesusroncal94.github.io · docs**. If it is the site's design file, evidence-library's docs
   file or anything else, stop and ask Jesus to connect the plugin from the docs file. Never
   change another Penpot file.
2. If a call reports a suspended tab, ask Jesus to bring the Penpot tab to the front and keep it
   visible while you work.
3. Never switch the file's token theme; the docs file has no themes, and switching one in the
   design file stalls the tab.

## 2. Edit in Penpot

1. Work on the diagram's own page and board (names in the manifest). A new diagram gets a new
   page and a kebab-case board, whose name becomes the file name.
2. Use only the file's library: the token colours and the five typographies (title, section,
   node title, body, note). Colour means a role, as in the style sheet; arrows follow its three
   kinds.
3. Content: English; the process and the architecture only, never the contents of `cv-manager`
   or a personal detail.
4. Review the board by exporting it to PNG with `export_shape`, and fix overlaps, overflowing or
   awkwardly wrapped text and stray lines before showing it to Jesus. The export server can time
   out on a cold font; retry.
5. Jesus approves the board before it is published.

## 3. Publish

The Penpot plugin cannot write to disk.

1. Ask Jesus to export the board as SVG, named after the board, to Downloads, and the whole file
   as `.penpot` when its structure changed (pages, library).
2. Check each downloaded SVG's content before copying it: Downloads may hold a file of the same
   name from evidence-library. Copy, never move, into `docs/diagrams/<board>.svg` and
   `docs/design/jesusroncal94-docs.penpot`.
3. Run `./tasks.ps1 diagrams`; a second run must report every file unchanged.
4. Update the export date in the manifest of `docs/design/README.md` (and add a row for a new
   diagram), and change the page that uses the diagram so its text says the same.
5. Run `./tasks.ps1 test`: `tests/docs.test.ts` checks the manifest, the pages, web fonts,
   scripts, token colours and links.
6. Commit on a branch (`docs(spdd): …` for documentation), and ask Jesus for a yes before
   pushing. A documentation-only pull request skips the Lighthouse jobs.
