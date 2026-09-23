# 002 — Case study deep dive

**As a** hiring manager evaluating seniority
**I want** to read how Jesus solved a real production problem
**So that** I can judge his engineering judgement, not only his stack

## Acceptance criteria

- WHEN the visitor reaches the case studies
  THEN four cards are shown: eval-driven prompts, the AI cost leak, the 112-PR merge
  campaign, and the Freya multi-agent architecture
- WHEN a card is opened
  THEN it follows Problem → Approach → Result, names his role, and ends with the stack
- WHEN a case study has a before/after number
  THEN it is shown as a before → after panel whose numbers count up when it scrolls into
  view (Phase 1), and later as a bespoke visual: slider, falling line, draining queue or
  agent graph (Phase 3, see analysis decision 2)
- WHEN the visitor has read one case study
  THEN a next-case link and the contact action are both reachable without scrolling back

## Definition of done

- Each case study is readable in under ninety seconds
- No client infrastructure detail beyond what the confidentiality check approved
