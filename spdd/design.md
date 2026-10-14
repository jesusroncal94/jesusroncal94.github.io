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
| Home        | Nav — Phone 320 · i18n suggestion | 004       |
| Home        | Case — Phone 390 · i18n suggestion | 004      |
| Home        | Home — Phone 390 · i18n menu | 004            |
| Home        | Home — Desktop 1440 · scrolled | 011          |
| Home        | Home — Tablet 834 · scrolled | 011            |
| Home        | Home — Phone 390 · scrolled | 011             |
| Home        | Home — Phone 390 · menu scrolled | 011        |
| Home        | Not found — Desktop 1440 | 012                |
| Home        | Not found — Phone 390  | 012                  |
| Home        | Not found — Desktop 1440 · es | 012           |
| Home        | Not found — Phone 390 · es | 012              |
| Home        | Home — Desktop 1440 · active section | 014  |
| Home        | Home — Tablet 834 · active section | 014    |
| Home        | Home — Phone 390 · menu active section | 014 |
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
| Cases       | Case 03 mechanism — Desktop 1440 · step 1 | 015    |
| Cases       | Case 03 mechanism — Desktop 1440 · step 3 | 015    |
| Cases       | Case 03 mechanism — Desktop 1440 · static | 015    |
| Cases       | Case 03 mechanism — Phone 390 · step 2    | 015    |
| Cases       | Case 03 mechanism — Phone 390 · static    | 015    |
| Cases       | Case 03 mechanism — Phone 390 · step 2 · es | 015  |
| Cases       | Case 01 mechanism — Desktop 1440 · step 3 | 016    |
| Cases       | Case 01 mechanism — Desktop 1440 · static | 016    |
| Cases       | Case 01 mechanism — Desktop 1440 · step 3 · es | 016 |
| Cases       | Case 01 mechanism — Phone 390 · step 4    | 016    |
| Cases       | Case 01 mechanism — Phone 390 · static    | 016    |
| Cases       | Case 01 mechanism — Phone 390 · step 2 · es | 016  |
| Cases       | Case 02 mechanism — Desktop 1440 · step 1 | 017    |
| Cases       | Case 02 mechanism — Desktop 1440 · static | 017    |
| Cases       | Case 02 mechanism — Desktop 1440 · step 3 · es | 017 |
| Cases       | Case 02 mechanism — Phone 390 · step 4    | 017    |
| Cases       | Case 02 mechanism — Phone 390 · static    | 017    |
| Cases       | Case 02 mechanism — Phone 390 · step 2 · es | 017  |
| Cases       | Case 04 mechanism — Desktop 1440 · step 1 | 018    |
| Cases       | Case 04 mechanism — Desktop 1440 · static | 018    |
| Cases       | Case 04 mechanism — Desktop 1440 · step 3 · es | 018 |
| Cases       | Case 04 mechanism — Phone 390 · step 4    | 018    |
| Cases       | Case 04 mechanism — Phone 390 · static    | 018    |
| Cases       | Case 04 mechanism — Phone 390 · step 2 · es | 018  |
| Home        | Home — Desktop 1440 · light (theme switch on Light) | 020 |
| Home        | Home — Phone 390 · light                  | 020    |
| Home        | Home — Phone 390 · menu · theme · light   | 020    |
| Home        | Home — Phone 390 · menu · theme (dark, System) | 020 |
| Home        | Nav — Desktop 1440 · theme switch (dark, System) | 020 |
| Cases       | Case 04 mechanism — Desktop 1440 · step 1 · light | 020 |
| Cases       | Case 04 mechanism — Phone 390 · step 4 · light | 020 |

The three Home frames sit side by side and share one set of components, so the responsive
behaviour of story 007 can be compared section by section. Each page starts at the origin,
with 200 px between frames and 400 px between rows, one row per story (spacing widened on
2026-10-07, when a 1,112 px frame overlapped the row below it); on Home, the story 004 frames form a
second row under the three layouts, the story 011 frames a third row, the story 012 frames a
fourth and the story 014 frames a fifth. The plugin API
cannot move a shape to another page, so they stay on Home.

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

- **Color** (`color.*`), dark / light: `canvas #09090B / #FAF8F5`,
  `surface #111114 / #FFFFFF`, `raised #18181C / #F2EFEA`, `border #26262C / #E7E2DA`,
  `border-strong #3A3A42 / #D6CFC4`, `primary #F4F4F5 / #1C1917`,
  `muted #A1A1AA / #57534E`, `subtle #80808A / #6B655E`, `signal #C8F55A / #3F6212`,
  `on-signal #0B0F02 / #FFFFFF`, `glow #7C6BFF / #4F46E5`, `before #FF7A6B / #B42318`,
  `dusk #2E266B / #EDE9FE`. Every text colour clears WCAG AA (4.5:1) on canvas, surface
  and raised in both modes. The light set is the "Piedra" palette (warm stone neutrals),
  chosen on 2026-10-14 for story 020 over the Phase 1 zinc values (`#FAFAF9`, `#F4F4F5`,
  `#09090B`, `#52525B`, `#6B6B74`, `#467010`, `#5B4BE8`, `#C81E1E`, …), which `tokens.css`
  still holds until story 020's code. Lowest light ratios: subtle 5.0:1 on raised, signal
  6.2:1, white on signal 7.1:1.
- **Light frames** (story 020; frames, theme control, its copy and the 12 % light float shadow
  approved on 2026-10-14): flat copies, every colour written as its light value with no
  token binding, so they read light while the file stays on `Mode / Dark`. Switching the theme
  in Penpot re-resolves every token in the file and stalls the browser tab; leave the file on
  Dark. Frame ids and the control's copy in `portfolioLib.theme`.
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
  switcher, so it points at where the choice lives. On phones it is a compact pill, "Ver en
  español", inside the nav row between the monogram and the menu (2026-10-03). It first
  floated under the nav, where it covered the identity row on the home page and the back
  link on case pages and the privacy note; placed in the page flow instead, it pushed the
  third proof metric under the contact bar. In the nav row it covers nothing and moves
  nothing, and it fits at 320 px. It is written in the target language.
- Ask the portfolio (story 005, drawn 2026-10-01) lives in the command palette dialog: the
  question in the input row, then the answer with numbered references, a numbered source list
  whose rows link to the page, and a footer with the receipt (tokens, cost, latency, grounding)
  and the privacy line. A refusal uses muted text, "Closest sources" and an "Email Jesus"
  action; the limit state keeps only the message and the action. Answers speak about Jesus in
  the third person, because the assistant is not him. Answer texts and receipt figures in the
  frames are illustrative.
- Pinned navigation (story 011, drawn 2026-10-05). The bar stays at the top while the page
  scrolls, on a solid canvas background with a one-pixel border line below it. A translucent
  bar was drawn first: at 85 % opacity the text underneath showed through and collided with the
  links, and the blur that would hide it cannot be drawn in Penpot and costs GPU on low-end
  phones. The scrolled frames show the state after a jump, with the section heading whole below
  the bar, and the tablet frame mid-scroll, with content passing under it. On phones the menu
  sheet opens under the pinned bar, and the contact bar stays at the bottom.
- Not found (story 012, drawn 2026-10-07). The page reads like the privacy note's column: the
  pinned navigation, then a 680 px column on desktop with "404" as the eyebrow, a two-line
  headline in the site's lead-and-accent style, one sentence, the home and email buttons, and
  the four case studies as a list of titled rows with an arrow. The case list is always shown,
  not only for addresses under `/work/`, so the page needs no script to decide it.
- Active section (story 014, drawn 2026-10-08). The bar marks the link of the section being
  read: its text turns from muted to primary and a 2 px signal line, as wide as the word, sits
  6 px under it, so the mark does not rest on colour alone. The phone menu marks the same row
  with the raised background and the same line under the word. The frames reuse the story 011
  scrolled states: desktop on Experience after a jump, tablet mid-scroll through Open source
  with Experience coming into view below (the section under the bar is still the one marked),
  and the phone menu opened over Experience.
- Case mechanism (story 015, drawn and approved with its copy on 2026-10-08, page Cases). Case
  03's Approach gets a panel after its first sentence: four stage cards in a row on desktop and
  a column on phones (queue, agents, gate, production) joined by arrows, then a step bar ("STEP
  1 OF 4", four dots, previous and next buttons) and the step's sentence. The queue and
  production are drawn as 112 dots, 14 × 8, in the before and signal colours; the agents as
  three worktree lanes fading out, so the drawing states no number of agents; the gate as one
  lane with a bar across it. The current stage has a signal border and number; the others keep
  their card and their text in `muted` and `subtle`, and only the drawing fades. A first
  version faded whole cards to 40 %, which put their text at 2.2–3.6:1 against the panel,
  under AA. The static version, for no script and reduced motion, shows every stage at full
  strength and the four sentences as a numbered list.
- Case 01 mechanism (story 016, drawn and approved with its copy on 2026-10-10, page Cases). The same panel as case 03, with
  four glyphs of its own in the same 82 × 46 box: the version as three segments joined by dots
  (major, minor, patch; no number is drawn), the fixtures as three sheets fading out (no count),
  the judge as 19 ticks, one per rubric item (the split across the 5 dimensions is not stated,
  so it is not drawn), and the release as two bars at 45.6 % and 100 % of the width. These
  frames draw the cards at 137 px, the width the built component gives them in the 680 px
  column; the case 03 frames had used 125 px. Spanish keeps a non-breaking space before `%`.
- Case 02 mechanism (story 017, drawn and approved with its copy on 2026-10-12, page Cases). The same panel, with four glyphs
  of its own: the ledger as three rows, the one without an owner outlined in the before colour;
  the trace as a dotted trail ending in a ring; the stale worker as a box in the before colour;
  and the guard as the before amount drawn full in the before colour over an empty track that
  starts with a signal dot, $0. No series, total, duration or detail of the worker is drawn.
  The first stage's detail reads "$12–16/day, no owner", the metric's format, so that "a" is
  not left at the end of a line.
- Case 04 mechanism (story 018, drawn and approved with its copy on 2026-10-13, page Cases). The
  same panel; every card draws the whole hourglass, seven 4 px rows narrowing to a 10 px waist
  and opening again, and lights its own part: the top row in four segments (the channels), the
  narrowing rows with three segments (the inbound subagents), the waist in signal (the facts-only
  knowledge base), the opening rows with three segments (the outbound subagents). No agent,
  handoff, volume or rate is drawn. Copy and frame ids in `portfolioLib.case04`.
- CV (story 019, mockup approved 2026-10-13). The CV has no Penpot frame; its design lives in
  `cv.astro` (canvas 003). The mockup is a rendering of that page with `cv-base.md`'s text, made
  in the scratchpad and never committed: 9 pt with a line height of 1.4, `@page` margins of
  10 mm by 12 mm, a role may break across pages but a bullet never does, and a role's heading
  stays with its first bullet. The English CV then fills two pages with a quarter of the second
  free.
- The portrait badges frame the face on a diagonal: the current role overhangs the top-left
  edge, the lead role the bottom-right, so neither covers the face (2026-09-27).

## Working with the Penpot MCP server

- The plugin runs inside the Penpot tab. If the browser hides or suspends that tab, the
  server stops receiving heartbeats and every call fails. Keep the Penpot window visible
  (for example side by side) while an agent works in it.
- The plugin's `storage` is lost when the plugin reconnects. The builder library is saved
  in the file itself, as plugin data (`portfolioLib.foundations`,
  `portfolioLib.sections`, `portfolioLib.patches`, `portfolioLib.social`, `portfolioLib.i18n`, `portfolioLib.ask`, `portfolioLib.privacy`, `portfolioLib.frames`, the case 03 copy and frame ids in `portfolioLib.case03`, case 01's in `portfolioLib.case01`, case 02's in `portfolioLib.case02` and case 04's in `portfolioLib.case04`), and can be
  reinstalled in one call.
- Only the active page can be edited, and a shape cannot be moved or cloned to another page.
  Open the page first (`penpot.openPage`).
- Shapes whose text changes need auto-height or auto-width set after they are added to a
  flex board, or they keep the width they had at creation.
