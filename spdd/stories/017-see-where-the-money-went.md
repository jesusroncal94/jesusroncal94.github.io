# 017 — See where the money went

**As a** hiring manager reading the AI cost case study end to end
**I want** to see how an unexplained daily spend was traced to its source and closed for good
**So that** I can judge the debugging method behind the $15/day → $0 result, not only the result

This story applies the case mechanism pattern of stories [015](015-see-how-the-queue-drained.md)
and [016](016-see-how-a-prompt-ships.md) to case 02, the third of the bespoke visuals deferred
to Phase 3 (decision 2 of the [Phase 1 analysis](../analysis/phase-1.md)). Case 04 was
considered first and set aside on 2026-10-12: `profile.md` names neither the roles of Freya's 7
agents nor the flow between them, so a step-through would have to invent it.

## Evidence (2026-10-12)

- Case 02 shows one visual today, the before → after panel "$15/day → $0". Its method lives in
  the prose of "Approach": 2 paragraphs, about 95 words in English.
- That prose describes a chain, every link of it stated in the case:
  - one bucket in the AI cost ledger had no owner: a chronic **$12–16 a day** that no feature
    accounted for;
  - the unattributed spend was followed back to its source instead of guessed at;
  - the source was **a stale background worker** that should not have been making those calls;
  - a guard in the code keeps the same situation from happening again, and the result was
    checked **in the production ledger: $0** a day.
- The case's metric states $15/day before and $0 after.
- What the case does not state, and so the visual cannot show: a day-by-day series of the
  spend, the amount spent in total, how long the leak ran, what the worker was or what it
  called, and the guard's code.
- The pattern from stories 015 and 016 takes stages as data and draws numbers only from the
  case; case 02 needs its own glyphs.

## Acceptance criteria

- WHEN a visitor reads case 02, in either language and at any width from 320 to 2560 px
  THEN a diagram of the chain sits with the Approach section, built from the same component as
  cases 01 and 03, with the same stepping, keyboard, live region and static version
- WHEN the visitor steps through it
  THEN each step highlights its link of the chain and shows one sentence about it
- WHEN the diagram shows a number
  THEN the case states it: $12–16 a day, $15/day and $0; no series, total, duration or detail
  of the worker
- WHEN cases 01 and 03 are read
  THEN their diagrams are unchanged
- WHEN the page loads
  THEN nothing shifts, and the diagram adds no request

## Definition of done

- Desktop and phone frames of the case 02 diagram, at a step and in the static version, exist in
  Penpot and are approved before code
- The stage copy, in English and Spanish, is approved before code
- The end-to-end run passes on case 02 and still on cases 01 and 03, in Chromium, Firefox and
  WebKit
- The overflow audit reports zero overflow at all 12 widths on case 02 in both languages
- The Lighthouse budget passes in CI, with case 02's LCP and CLS unchanged
