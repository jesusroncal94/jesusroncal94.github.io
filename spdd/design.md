# Design reference

Mockups live in Figma and are the visual source of truth for the canvases in
`canvases/`: [Portfolio — Jesús Roncal](https://www.figma.com/design/Ni2dXlZEpSN9HwhSGafsXU).

| Page        | Frame                   | Node   | Stories       |
| ----------- | ----------------------- | ------ | ------------- |
| Foundations | Foundations             | `2:3`  | —             |
| Desktop     | Home — Desktop 1440     | `3:5`  | 001, 002, 003, 005 |
| Mobile      | Home — Mobile 390       | `8:5`  | 001, 003, 005 |

## Tokens

- **Color** (collection `Color`, mode `Dark`): `bg/canvas #09090B`, `bg/surface #111114`,
  `bg/raised #18181C`, `border/default #26262C`, `border/strong #3A3A42`,
  `text/primary #F4F4F5`, `text/muted #A1A1AA`, `text/subtle #80808A`,
  `accent/signal #C8F55A`, `accent/on-signal #0B0F02`, `accent/glow #7C6BFF`,
  `status/before #FF7A6B`.
- **Light mode** is defined only here, because the Figma Starter plan allows one mode:
  `bg/canvas #FAFAF9`, `bg/surface #FFFFFF`, `bg/raised #F4F4F5`,
  `border/default #E4E4E7`, `border/strong #D4D4D8`, `text/primary #09090B`,
  `text/muted #52525B`, `text/subtle #6B6B74`, `accent/signal #467010`,
  `accent/on-signal #FFFFFF`,
  `accent/glow #5B4BE8`, `status/before #C81E1E`. Every text token clears WCAG AA
  (4.5:1) on canvas, surface and raised in both modes.
- **Dimension**: spacing `4 8 12 16 24 32 48 64 96`, radius `8 14 24 999`.
- **Type**: Geist (UI and headings), Instrument Serif Italic (the accent line of each
  headline), Geist Mono (labels, receipts, dates). All three are on Google Fonts.

## Components

`Button` (Primary / Secondary / Ghost), `StatusChip`, `StackTag`, `MetricTile`,
`Receipt`, `Citation`, `AskPrompt`, `CaseCard`.

## Decisions taken in the mockups

- One accent line per headline in serif italic, in the signal colour. It is the only
  decorative device on the page besides the violet aurora behind the Ask prompt.
- Phone above the fold (844px): name, headline, three proof rows and a sticky contact
  bar with "Download CV". The metric tiles become one-line rows on mobile.
- The Ask section shows one grounded answer and one refusal side by side, so the
  refusal reads as a feature.
- Case study copy uses the softened wording from the confidentiality check: no
  infrastructure detail for the cost leak, no Intercorp business metrics.

## Constraints

- Figma Starter: 3 pages, 1 variable mode, 6 read calls per month through the MCP
  server. Writes are unlimited, so visual checks are taken from inside write scripts.
