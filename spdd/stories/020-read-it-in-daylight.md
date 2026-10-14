# 020 — Read it in daylight

**As a** recruiter whose phone or laptop is set to a light appearance, often reading in daylight
**I want** the site to follow that setting, and to be able to switch it myself
**So that** it reads comfortably where I am, without a dark page standing out from everything
else on my screen

Phase 1 shipped dark only, as the approved design (canvas 000). The light tokens have existed
since then, unused except by the CV page. This story designs and ships the light theme.

## Evidence (2026-10-14)

- **The light tokens exist, in code and in the design.**
  - `src/styles/tokens.css` holds a full light set under `[data-theme='light']`.
  - Penpot has the sets `color/dark` and `color/light`, switched by the themes `Mode / Dark` and
    `Mode / Light` (`spdd/design.md`).
  - All text tokens were checked at 4.5:1 or better in both modes during the Phase 1 analysis.
- **Only the CV uses them.** `/cv/` renders with `theme="light"`. Every other page is dark, and
  the site ignores `prefers-color-scheme`.
- **No colour is hard-coded** outside `tokens.css` in components, pages or styles (searched
  2026-10-14), so every surface already reads the tokens.
- **No page has been designed in light.** Penpot has no light frame of the home page, a case
  page or the diagrams. Glows, the portrait's frame, the before/after colours and the four case
  diagrams were drawn for dark only.
- **What visitors prefer is unknown.** The analytics record neither colour scheme nor a toggle,
  so the story rests on the convention that a site follows the system setting, not on measured
  demand.
- The preview cards (Open Graph images) are rendered dark, and the CV is light. Neither depends
  on the visitor's setting.

## Acceptance criteria

- WHEN a visitor's system asks for a light appearance
  THEN every page renders in the light theme from the first paint, with no flash of the dark one,
  and the same holds with scripts disabled
- WHEN the system asks for dark, or says nothing
  THEN the site is dark, as today
- WHEN the visitor uses the theme control
  THEN the site switches at once, the choice is kept on their next visit, and they can return to
  following the system
- WHEN the theme control is reached by keyboard or a screen reader
  THEN it is operable, its state is announced, and it meets the site's focus and target-size
  rules
- WHEN any page is read in either theme
  THEN all text meets WCAG 2.2 AA contrast, and the case diagrams, before/after panels, portrait
  and glows read as designed for that theme
- WHEN a preview card or the CV is produced
  THEN the preview card stays dark and the CV stays light, at two pages, whatever the visitor's
  theme (amended 2026-10-14: the CV takes the new light palette rather than looking exactly as
  before; decision 3 of the analysis)
- WHEN a page loads in either theme
  THEN nothing shifts, and the Lighthouse budget still passes

## Definition of done

- Light frames of the home page and one case page with its diagram, desktop and phone, and of the
  theme control in both themes, exist in Penpot and are approved before code
- Any new user-facing text (the control's label and states) is approved in English and Spanish
- The end-to-end runs pass in both themes, in Chromium, Firefox and WebKit
- The overflow audit reports zero overflow at all 12 widths on `/` and one case page, in both
  themes
- Contrast is checked on every text token pair in the light theme
- The Lighthouse budget passes in CI, in the light theme as well as the dark one
