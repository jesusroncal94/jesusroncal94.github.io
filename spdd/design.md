# Design reference

Mockups live in **Penpot** and are the visual source of truth for the canvases in
`canvases/`. The file is **Portfolio — Jesús Roncal** in Jesus's Penpot drafts
(design.penpot.app).

| Page        | Frame                  | Stories                 |
| ----------- | ---------------------- | ----------------------- |
| Foundations | Components             | —                       |
| Home        | Home — Desktop 1440    | 001, 002, 003, 007      |
| Home        | Home — Tablet 834      | 007                     |
| Home        | Home — Phone 390       | 001, 003, 007           |
| Social      | OG — Home 1200×630     | 008                     |
| Social      | OG — Case 02 1200×630  | 008                     |
| Social      | OG — Case 04 1200×630  | 008                     |
| Home        | Home — Desktop 1440 · i18n | 004              |
| Home        | Home — Phone 390 · i18n suggestion | 004      |
| Home        | Home — Phone 390 · i18n menu | 004            |
| Ask         | Ask — Desktop 1440 · answer  | 005            |
| Ask         | Ask — Desktop 1440 · refusal | 005            |
| Ask         | Ask — Phone 390 · answer     | 005            |
| Ask         | Ask — Phone 390 · limit      | 005            |
| Privacy     | Privacy — Desktop 1440       | 009            |
| Privacy     | Privacy — Phone 390          | 009            |
| Privacy     | Home footer — Desktop 1440   | 009            |
| Privacy     | Home footer — Phone 390      | 009            |
| Privacy     | Case end — Desktop 1440      | 009            |
| Privacy     | Case end — Phone 390         | 009            |

The three Home frames sit side by side and share one set of components, so the responsive
behaviour of story 007 can be compared section by section.

### History

Phase 1 was designed in Figma
([Portfolio — Jesús Roncal](https://www.figma.com/design/Ni2dXlZEpSN9HwhSGafsXU): Foundations
`2:3`, Desktop `3:5`, Mobile `8:5`), and the canvases for 000–006 cite those nodes. On
2026-09-24 the Figma Starter plan ran out of MCP calls halfway through the tablet frame, so
the design moved to Penpot. Penpot is free, open source, and has an official MCP server,
which Penpot hosts, so it stays on the same version as the cloud. Everything was rebuilt
there from the code, which by then was the more faithful source. The Figma file stays as a
read-only record of Phase 1.

## Tokens

Penpot tokens, in the sets `color/dark`, `color/light` and `core`, switched by the themes
`Mode / Dark` and `Mode / Light`. Both modes now live in the design, not only in this file.

- **Color** (`color.*`), dark / light: `canvas #09090B / #FAFAF9`,
  `surface #111114 / #FFFFFF`, `raised #18181C / #F4F4F5`, `border #26262C / #E4E4E7`,
  `border-strong #3A3A42 / #D4D4D8`, `primary #F4F4F5 / #09090B`,
  `muted #A1A1AA / #52525B`, `subtle #80808A / #6B6B74`, `signal #C8F55A / #467010`,
  `on-signal #0B0F02 / #FFFFFF`, `glow #7C6BFF / #5B4BE8`, `before #FF7A6B / #C81E1E`,
  `dusk #2E266B / #E9E6FF`. Every text colour clears WCAG AA (4.5:1) on canvas, surface
  and raised in both modes.
- **Spacing** (`space.*`): `4 8 12 16 20 24 32 40 48 64 80 96 120`.
- **Radius** (`radius.*`): `sm 8`, `md 14`, `lg 24`, `full 999`.
- **Font families** (`font.*`): Geist, Geist Mono, Instrument Serif.

## Typography

Twenty library typographies mirror the type utilities in `src/styles/typography.css`. The
fluid styles have one typography per layout, each at the size the `clamp()` produces at
that frame's width (see the Phase 1.1 analysis):

| Style | Phone 390 | Tablet 834 | Desktop 1440 |
| ----- | --------- | ---------- | ------------ |
| Display | 44 / 48 | 58 / 62 | 76 / 80 |
| Display Serif | 50 / 48 | 64 / 62 | 84 / 80 |
| Heading H2 | 32 / 36 | 37 / 42 | 44 / 50 |
| Metric L | 34 / 40 (Metric M) | 40 / 44 | 48 / 52 |

Fixed styles: Heading H3, Metric M, Metric S, Body L / M / S, Button M, Label Mono,
Code Mono.

## Components

`Button` (variants Style = Primary / Secondary / Ghost), `StatusChip`, `StackTag`,
`MetricTile`, `BeforeAfter`, `CaseCard`, `PalettePrompt`. Colours are bound to tokens.

## Decisions taken in the mockups

- One accent line per headline, in serif italic, in the signal colour. It is the only
  decorative device besides the violet aurora behind the hero prompt. In Penpot the
  headline is two stacked text layers, because styling part of a text layer is
  unreliable through the plugin API. The site renders it as one heading.
- Phone above the fold (844 px): name, headline, three proof rows and a sticky contact bar
  with "Download CV".
- Tablet (768–1279 px) stacks the hero around an identity row, shows the metrics as
  2 × 2 tiles, puts cases and repositories in one column, and lays the timeline out in two
  columns.
- Case study copy uses the approved, softened wording.
- Link previews (Social page, approved 2026-09-30) reuse the site's tokens and type at
  1200 × 630. The home card pairs the desktop headline with the portrait. The case cards put
  the before → after metric at Display size, so it survives as a 400 px thumbnail. Case 04,
  the longest metric, is drawn to prove it fits on one line.
- Language (story 004, drawn 2026-09-30). An EN / ES segmented switch sits in the desktop
  nav before "Email me", and in a "Language" row at the foot of the phone menu sheet. The
  suggestion floats and never shifts the layout. On desktop it is a card anchored under the
  switcher, so it points at where the choice lives. On phones it is a one-line pill under the
  nav, because a card there would cover the headline. It is written in the target language.
- Ask the portfolio (story 005, drawn 2026-10-01) lives in the command palette dialog: the
  question in the input row, then the answer with numbered references, a numbered source list
  whose rows link to the page, and a footer with the receipt (tokens, cost, latency, grounding)
  and the privacy line. A refusal uses muted text, "Closest sources" and an "Email Jesus"
  action; the limit state keeps only the message and the action. Answers speak about Jesus in
  the third person, because the assistant is not him. Answer texts and receipt figures in the
  frames are illustrative.
- The portrait badges frame the face on a diagonal: the current role overhangs the top-left
  edge, the lead role the bottom-right, so neither covers the face (2026-09-27).

## Working with the Penpot MCP server

- The plugin runs inside the Penpot tab. If the browser hides or suspends that tab, the
  server stops receiving heartbeats and every call fails. Keep the Penpot window visible
  (for example side by side) while an agent works in it.
- The plugin's `storage` is lost when the plugin reconnects. The builder library is saved
  in the file itself, as plugin data (`portfolioLib.foundations`,
  `portfolioLib.sections`, `portfolioLib.patches`, `portfolioLib.social`, `portfolioLib.i18n`, `portfolioLib.ask`, `portfolioLib.frames`), and can be
  reinstalled in one call.
- Shapes whose text changes need auto-height or auto-width set after they are added to a
  flex board, or they keep the width they had at creation.
