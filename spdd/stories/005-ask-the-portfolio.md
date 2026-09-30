# 005 — Ask the portfolio

**As a** technical interviewer preparing a session
**I want** to ask questions about Jesus's work and get grounded answers
**So that** I can probe specific experience before we talk

## Evidence (2026-10-01)

Revised before the mockups. `rag-assistant`, the public service this story runs on, reports
its own limits in its README, measured on a holdout set:

| | Right source retrieved | Answered when it could |
| --- | --- | --- |
| Terse questions | 10 of 10 | 8 of 10 |
| Questions phrased the way people write | 6 of 6 | **1 of 6** |

Retrieval is BM25: it matches words, so it cannot tell that two phrasings mean the same thing,
and a Spanish or Italian question over English text finds nothing. An interviewer asks in
natural language and, on this site, possibly in Spanish. Used as it is, the assistant would
refuse most real questions. Improving retrieval is therefore part of this story, and the
improvement is measured, as `rag-assistant` measures everything.

## Acceptance criteria

- WHEN the visitor submits a question the public profile supports
  THEN the answer streams, cites its sources, and each citation links to the matching
  section of the page and highlights it
- WHEN the question is not supported by the profile
  THEN the assistant declines explicitly and shows the closest sources instead of guessing
- WHEN the question tries to make the assistant ignore its instructions, reveal them, or talk
  about something other than Jesus's work
  THEN it declines the same way, and the planted prompt-injection case still refuses
- WHEN any answer or refusal completes
  THEN a receipt shows tokens, cost, latency and grounding score
- WHEN the visitor writes in Spanish (or, once 004b ships, Italian)
  THEN retrieval still finds the English sources, and the answer comes back in that language
- WHEN the monthly budget or the per-visitor rate limit is reached
  THEN the prompt says so plainly and offers the email action instead
- WHEN the assistant's backend is unreachable or slow
  THEN the command palette keeps working as navigation, and nothing else on the page breaks
- WHEN a question is asked
  THEN its text is not stored anywhere: only anonymous counters (answered, declined, cost,
  latency) are kept, and the page says so next to the prompt

## Definition of done

- Mockups in Penpot for the answer, the refusal, the receipt and the limit states (phone and
  desktop) are approved before code
- It runs on the public `rag-assistant`, over the public profile export and the site's
  approved copy only, never `cv-manager`
- An evaluation set of interviewer questions, in English and Spanish, written before any
  threshold is chosen, is committed with its holdout split. On the holdout, natural
  questions in both languages reach an agreed answer rate, which is set in the analysis,
  with no increase in wrong answers. The before and after are reported in the
  `rag-assistant` README, including anything that stays weak
- Spending cannot exceed the monthly budget, enforced by the backend and not only the UI
- The static site's Lighthouse budget still passes: the assistant loads only when opened

**✅ Approved on 2026-10-01:** the revised story, with three product decisions:
- **Budget:** a hard cap of US$5 a month, enforced by the backend, and about 10 questions per
  visitor per day. The exact per-question cost is worked out in the analysis from verified
  prices.
- **Privacy:** question text is never stored; only anonymous counters are kept.
- **Retrieval:** the improvement lands in the public `rag-assistant` repository, with its
  before and after measured in that repository's README.
