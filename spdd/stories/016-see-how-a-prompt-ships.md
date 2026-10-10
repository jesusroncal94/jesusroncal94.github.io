# 016 — See how a prompt ships

**As a** hiring manager reading the evals case study end to end
**I want** to see how a prompt change became a measured release
**So that** I understand the eval loop at a glance and can judge the engineering discipline
behind the 45.6% → 100% result

This story applies the case mechanism pattern of story [015](015-see-how-the-queue-drained.md)
to case 01, the second of the bespoke visuals deferred to Phase 3 (decision 2 of the
[Phase 1 analysis](../analysis/phase-1.md)).

## Evidence (2026-10-10)

- Case 01 shows one visual today, the before → after panel "45.6% → 100%". Its mechanism lives in
  the prose of "Approach": 2 paragraphs, about 130 words in English.
- That prose describes a loop, every part of it stated in the case:
  - prompts are versioned artefacts with semantic versions, so a change is a release with a
    number;
  - a set of test fixtures runs against each version;
  - an LLM-as-judge rubric scores every output on **5 dimensions and 19 items**;
  - the score is compared with the last version's, instead of an impression;
  - every call reports its tokens, cost and latency, so a change that improves quality but
    doubles the bill shows on the dashboard first.
- The case also states the outcome: structural conformance from **45.6% to 100%**, and output
  tokens down by **about 71%** on the bloated cases.
- What the case does not state, and so the visual cannot show: how many fixtures there are, how
  the 19 items split across the 5 dimensions, how many prompt versions it took, and the score
  of any version between the first and the last.
- The pattern from story 015 is built for this: the component takes stages as data, the copy
  lives in the case's frontmatter and is reviewed with it, and a new case needs at most new
  glyphs. Case 01 needs its own glyphs; the queue's dots, lanes and gate do not fit a loop.

## Acceptance criteria

- WHEN a visitor reads case 01, in either language and at any width from 320 to 2560 px
  THEN a diagram of the eval loop sits with the Approach section, built from the same component
  as case 03, with the same stepping, keyboard, live region and static version
- WHEN the visitor steps through it
  THEN each step highlights its part of the loop and shows one sentence about it
- WHEN the diagram shows a number
  THEN the case states it: the 5 dimensions, the 19 items, 45.6% and 100%; no count of
  fixtures or versions, no split of the items, no intermediate score
- WHEN case 03 is read
  THEN its diagram is unchanged
- WHEN the page loads
  THEN nothing shifts, and the diagram adds no request

## Definition of done

- Desktop and phone frames of the case 01 diagram, at a step and in the static version, exist in
  Penpot and are approved before code
- The stage copy, in English and Spanish, is approved before code
- The story 015 end-to-end run passes on case 01 and still on case 03, in Chromium, Firefox and
  WebKit
- The overflow audit reports zero overflow at all 12 widths on case 01 in both languages
- The Lighthouse budget passes in CI, with case 01's LCP and CLS unchanged
