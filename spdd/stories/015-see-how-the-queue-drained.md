# 015 — See how the queue drained

**As a** hiring manager reading the 112-PR case study end to end
**I want** to see the mechanism behind the result, not only read it
**So that** I grasp in a few seconds how parallel agents and a serial gate cleared the queue
safely, and can judge the engineering decision behind it

This story delivers the first of the bespoke case visuals that story 002 deferred to Phase 3
(decision 2 of the [Phase 1 analysis](../analysis/phase-1.md), 2026-09-23), for case 03, the
"draining queue". It also sets the pattern the other cases would follow.

## Evidence (2026-10-08)

- Every case page shows one visual today: the before → after panel at the top, whose numbers
  count up. For case 03 it reads "112 queued → 0". The mechanism lives only in the prose of
  "Approach": 3 paragraphs, about 100 words in English.
- The mechanism in that prose has a clear shape, and every part of it is stated in the case:
  - 112 pull requests across 4 repositories;
  - **parallel preparation:** Claude Code agents, each in an isolated git worktree, rebased
    the pull requests by content and stacked dependent changes into chains;
  - **serial admission:** every pull request passed a no-new-failures gate before merging;
  - all 112 reached production in about 30 hours.
- What the case does not state, and so the visual cannot show: how many agents ran, how the
  112 split across the 4 repositories, and how the queue shrank hour by hour. None of the four
  cases has a series over time, which rules out a chart of the queue draining; a mechanism
  diagram needs no invented number.
- The Phase 1 plan also listed a "falling line" for case 02. It would need daily spend
  figures the case does not have, which is one more reason to start with case 03.
- Analytics cannot yet say which case is read most or where readers stop: real traffic is
  still too thin (the weekly watch of pending 10).

## Acceptance criteria

- WHEN a visitor reads case 03, in either language and at any width from 320 to 2560 px
  THEN a diagram of the mechanism sits with the Approach section: the queue of 112 across 4
  repositories, the parallel agents in their worktrees, the serial no-new-failures gate, and
  production
- WHEN the visitor steps through the diagram, with buttons or the keyboard
  THEN each step highlights its part and shows one sentence about it, in the page's language
- WHEN the visitor uses a screen reader
  THEN the diagram has a text equivalent, and the current step is announced when it changes
- WHEN scripts are disabled or the visitor prefers reduced motion
  THEN the whole mechanism is visible at once, with its steps numbered and described, and
  nothing animates
- WHEN the diagram is drawn
  THEN it shows no number the case does not state: no count of agents, no split per
  repository, no timeline beyond the 30 hours
- WHEN the page loads
  THEN nothing shifts, and the diagram adds no request

## Definition of done

- Desktop and phone frames of the diagram, at its first step and at a later one, plus the
  static version, exist in Penpot and are approved before code
- The step sentences in English and Spanish are approved by Jesus before code
- An end-to-end check steps through the diagram with the mouse and the keyboard in both
  languages, and checks the static version without scripts and with reduced motion
- The overflow audit reports zero overflow at all 12 widths on the case page, in both
  languages
- The Lighthouse budget still passes on every page, in CI, and LCP on the case page does not
  rise
- The component takes its steps as data, so a second case can reuse it without changing it
