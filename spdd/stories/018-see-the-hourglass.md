# 018 — See the hourglass

**As a** hiring manager reading the Freya case study end to end
**I want** to see the shape Freya's AI layer was built on: many ways in, one store of facts,
prose on the way out
**So that** I can judge the architecture model Jesus authored, separately from the platform the
team built on it

This story applies the case mechanism pattern of stories [015](015-see-how-the-queue-drained.md),
[016](016-see-how-a-prompt-ships.md) and [017](017-see-where-the-money-went.md) to case 04, the
last of the bespoke visuals deferred to Phase 3 (decision 2 of the
[Phase 1 analysis](../analysis/phase-1.md)). It was set aside on 2026-10-12 because `profile.md`
did not describe the flow; on 2026-10-13 the Freya bullet was re-verified against the Freya
repositories and rewritten, and case 04 was corrected to match (incident in
[canvas 002](../canvases/002-case-study-deep-dive.md)).

## Evidence (2026-10-13)

- Case 04 shows one visual today, the before → after panel "7 agents → 1 story graph". Its
  architecture lives in the prose of "Approach": 4 paragraphs and 2 lists, about 200 words in
  English.
- The second paragraph of Approach describes the hourglass, every part of it stated in the case:
  - **ways in:** four channels, voice-first creation, guided questions, character interviews
    and manuscript import;
  - **inbound subagents** extract, summarise and structure what comes in;
  - **the narrow waist:** a single knowledge base that holds only facts;
  - **prose generation** draws on that base;
  - **outbound subagents** generate, validate and enrich the result, which closes the loop.
- The Result section names the design choice: whatever the input, it becomes facts first, and
  generation reads only from those.
- Attribution, from `profile.md`: the hourglass model is Jesus's; the agents, the guard
  pipeline, the knowledge graph and the co-editing were mainly built by other team members.
- What the case does not state, and so the visual cannot show: handoffs between agents (there
  are none; the author picks the agent), throughput, latency or volumes, the size of the
  knowledge base, or how often the loop runs.
- The pattern from stories 015–017 takes stages as data and draws numbers only from the case;
  case 04 needs its own glyphs.

## Acceptance criteria

- WHEN a visitor reads case 04, in either language and at any width from 320 to 2560 px
  THEN a diagram of the hourglass sits with the Approach section, built from the same component
  as cases 01–03, with the same stepping, keyboard, live region and static version
- WHEN the visitor steps through it
  THEN each step highlights one part of the hourglass and shows one sentence about it
- WHEN the diagram shows a count
  THEN the case states it: the four channels and the three subagents on each side; no volume,
  rate, size or frequency
- WHEN the diagram shows the seven agents or any other part of the platform
  THEN it is not drawn as Jesus's work, and no agent hands work to another
- WHEN cases 01–03 are read
  THEN their diagrams are unchanged
- WHEN the page loads
  THEN nothing shifts, and the diagram adds no request

## Definition of done

- Desktop and phone frames of the case 04 diagram, at a step and in the static version, exist in
  Penpot and are approved before code
- The stage copy, in English and Spanish, is approved before code
- The end-to-end run passes on case 04 and still on cases 01–03, in Chromium, Firefox and WebKit
- The overflow audit reports zero overflow at all 12 widths on case 04 in both languages
- The Lighthouse budget passes in CI, with case 04's LCP and CLS unchanged
