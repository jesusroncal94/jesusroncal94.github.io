# 005 — Ask the portfolio

**As a** technical interviewer preparing a session
**I want** to ask questions about Jesus's work and get grounded answers
**So that** I can probe specific experience before we talk

## Acceptance criteria

- WHEN the visitor submits a question the public profile supports
  THEN the answer streams, cites its sources, and each citation scrolls to and highlights
  the matching section of the page
- WHEN the question is not supported by the profile
  THEN the agent declines explicitly and shows the closest sources instead of guessing
- WHEN any answer completes
  THEN a receipt shows tokens, cost, latency and grounding score
- WHEN the visitor writes in Spanish or Italian
  THEN the answer comes back in that language
- WHEN the daily budget or the per-visitor rate limit is reached
  THEN the prompt says so plainly and offers the email action instead

## Definition of done

- Runs on the public `rag-assistant` over the public profile only
- The planted prompt-injection case from `rag-assistant` still refuses
