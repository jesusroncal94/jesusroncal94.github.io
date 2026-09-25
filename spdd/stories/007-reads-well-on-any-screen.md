# 007 — Reads well on any screen

**As a** visitor on whatever device I happen to use — a small phone, a tablet, a laptop or a
wide monitor
**I want** the site to lay itself out for my screen
**So that** nothing overflows, nothing is cramped, and the content reads as intended

## Evidence (audit, 2026-09-24)

A Playwright audit of the production build at 11 widths found:

| Width | Finding |
| ----- | ------- |
| 320–360 px | The page overflows by 60 and 20 px: the contact bar's buttons and long repository names |
| 768–1024 px | The page overflows by up to 400 px: the 420 px portrait and the fixed four-column timeline. Metric tiles, cards and before → after values wrap mid-phrase ("112 / queued"), and the headline runs to five lines |
| 1280 px | The headline wraps to four lines beside the portrait |
| 1920 px | Every section stretches edge to edge, pushing the headline and portrait apart and making lines too long |

The cause: the layout has two states, phone (< 768 px) and a desktop drawn at a fixed
1440 px, with nothing in between or beyond.

## Acceptance criteria

- WHEN the page is rendered at any width from 320 to 2560 px
  THEN nothing overflows horizontally
- WHEN the width is between 768 and 1279 px
  THEN the page uses a tablet layout: a stacked hero with the identity row, two-by-two
  metrics, single-column case and repository cards, and a two-column timeline
- WHEN the width is 1280 px or more
  THEN the desktop layout from the approved frame is used, inside a centred content column
  no wider than 1280 px
- WHEN a before → after value or a metric wraps
  THEN it wraps between values, never inside one
- WHEN the headline is rendered
  THEN its size scales with the viewport and it never takes more than three lines above
  390 px

## Definition of done

- The same audit reports zero overflow at all 11 widths, plus 2560 px
- Phone, tablet and desktop frames exist in the design tool (Penpot) and are approved before code
- The Lighthouse budget still passes on every page
