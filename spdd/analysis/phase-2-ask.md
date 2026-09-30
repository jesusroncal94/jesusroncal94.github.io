# Analysis — Phase 2: Ask the portfolio

Step 3 of the SPDD flow for story [005](../stories/005-ask-the-portfolio.md). Inputs: the story
as approved on 2026-10-01, the four frames on the Ask page of the Penpot file (see
[../design.md](../design.md)), and the `rag-assistant` repository as of commit `96321d9`.

## 1. Diagnosis

### What `rag-assistant` already gives

| Piece | State |
| --- | --- |
| Refusal as a product state | `/ask` returns `grounded: false` with `reason` and the closest sources, with status 200 |
| Grounding guardrail | Checks that the answer is held up by the retrieved chunks, and reports a `grounding_score` |
| Prompt versioning | The prompt version travels with every answer |
| Evaluation gate | 41 questions, a holdout split, exits non-zero on regression |
| Prompt-injection case | Planted in the corpus, and refused |
| Model adapter | A deterministic stand-in for tests, or any OpenAI-compatible endpoint |

### What it lacks for this story

| Gap | Why it matters here |
| --- | --- |
| Retrieval is BM25 only | 1 of 6 natural questions answered; a Spanish question over English text finds nothing |
| The corpus is four banking documents | This story needs the public profile and the site's approved copy, chunked by page section so citations can link to `#anchors` |
| No streaming | The story requires the answer to stream |
| No token, cost or latency accounting | The receipt needs them |
| No budget or rate limit | The story requires a hard monthly cap and a per-visitor limit |
| Only an OpenAI-compatible adapter | Claude is called through the official `anthropic` SDK, not through a compatibility shim |
| Not deployed anywhere | GitHub Pages is static, so the service needs its own host |

## 2. Direction

The work spans two repositories, and it splits cleanly into three canvases:

| Canvas | Repository | What |
| --- | --- | --- |
| **005a — Retrieval** | `rag-assistant` | The interviewer evaluation set, written first; multilingual hybrid retrieval; a Claude adapter; the before and after in the README |
| **005b — Service** | `rag-assistant` | Streaming endpoint, receipt, budget and rate limit, CORS, deployment |
| **005c — Ask UI** | this site | The corpus export by section, and the palette's ask mode from the frames |

005a comes first because it decides whether the idea works at all. If the measured answer rate
cannot reach the target, we learn it before building a service and a UI around it.

### Decision 1 — Hosting

| Option | Verdict |
| --- | --- |
| **Google Cloud Run, `europe-west8` (Milan)** | **Recommended.** Scales to zero, and the free tier covers a portfolio's traffic. It runs the existing Dockerfile as it is, streams responses, keeps the data in the EU, and sits next to Vertex AI (decision 2) and Firestore (decision 4) |
| Fly.io / Render | Workable, but the free tiers sleep or are shrinking, and the models and the counters would live with other providers |
| AWS Lambda | Response streaming and a Python image with an embedding model make it the most awkward fit |

### Decision 2 — Model and provider

Prices verified on 2026-10-01 (per million tokens, Anthropic list):

| Model | Input | Output | Cost per question (≈3,000 in, ≈500 out incl. thinking) | Questions per US$5 |
| --- | --- | --- | --- | --- |
| Claude Opus 5.5 (`claude-opus-5-5`), effort `low` | $4 | $20 | ≈ $0.022 | ≈ 225 |
| Claude Sonnet 5.5 (`claude-sonnet-5-5`), effort `low` | $2 | $10 | ≈ $0.011 | ≈ 450 |
| Claude Haiku 4.5 (`claude-haiku-4-5`) | $1 | $5 | ≈ $0.0045 | ≈ 1,100 |

The model is Jesus's call; the table only states what each option costs. Grounded answers over
a short, curated context are an easy task, so the evaluation in 005a will show whether a
lighter model holds quality. It runs the same question set on each model, and the choice is
confirmed there with numbers.

- **Provider — recommended: Claude on Vertex AI, region `eu`.**
  - Anthropic's own API can pin inference only to `us` or `global`. Vertex keeps the
    visitor's question inside the EU, next to the service.
  - Billing and budget alerts live in the same Google Cloud project.
  - Vertex prices Claude separately from Anthropic's list. The prices above are the
    reference until 005a confirms the Vertex rate for the chosen model in the `eu` region.
  - If the chosen model is not served in `eu`, the fallback is Anthropic's API with a note
    on the page.
- **Integration:** the official `anthropic` Python SDK's Vertex client, added as a new model
  adapter beside the existing stand-in, so tests stay hermetic.

### Decision 3 — Retrieval

- **Recommended: hybrid retrieval.** BM25 and multilingual dense embeddings are fused with
  reciprocal rank fusion. Embeddings come from a small multilingual model that runs **inside
  the service**, such as `multilingual-e5-small` in ONNX form: no per-question cost, no third
  party, and a reproducible evaluation.
- **Order of work:**
  1. Write the interviewer set, English and Spanish, answerable and unanswerable, plus
     injection attempts. Freeze the holdout split before any threshold is chosen.
  2. Measure BM25 on it, as the "before".
  3. Add dense retrieval and fusion, re-tune the confidence floor on the development split
     only, and measure the holdout.
- **If the dense model is not enough,** the fallback is an LLM query rewrite that turns the
  question into the profile's English vocabulary before BM25. It costs one extra call per
  question, so it is the second option, not the first.
- **Cold start:** loading a small ONNX model adds roughly 1–3 s to the first request after
  idle. 005b measures it and decides whether one warm instance is worth its cost.

### Decision 4 — Budget and rate limit

- **The hard cap is enforced before the model call.**
  - A monthly spend counter in Firestore (free tier) is updated transactionally with each
    answer's real cost, taken from the model's `usage`.
  - A question is rejected when the counter plus the worst case for one answer would pass
    US$5.
  - Google Cloud budget alerts are a backstop that notifies; they do not stop spending.
- **Per-visitor limit:** 10 questions a day, keyed by a salted hash of the IP address.
  - The salt rotates daily and each entry expires after 24 hours, so no identifier survives
    a day, and the question text is never stored.
- **Cost bounds on every request:** single-turn questions only (no conversation history), a
  maximum question length, a fixed `max_tokens`, and CORS limited to the site's origin.

### Decision 5 — Corpus source

The site is the source of truth for the approved copy.
- Its build emits `ask-corpus.json`: one chunk per page section, each with its `url#anchor`,
  its title and its text, in English.
- It is built from `site/en.yaml`, the four cases and `public-profile.json`, the same public
  data the pages render, and never `cv-manager`.
- The service fetches the file at startup, so the site and the service deploy independently,
  and a copy change reaches the assistant on the next restart.

### Decision 6 — The target

On the holdout split of the new interviewer set:
- **Answerable questions, natural phrasing, English and Spanish:** answered with a correct
  citation in at least **80%** (today's baseline is 1 of 6 on the banking corpus). 005a
  measures the real "before" on this corpus first.
- **Unanswerable questions and injection attempts:** **0** answered. A refusal is always
  better than a wrong answer.
- **Grounding:** every answered question has a `grounding_score` at or above the existing
  guardrail threshold.

If 80% is unreachable without answering an unanswerable question, the gap is reported, as the
README already does, and the target is not lowered silently.

## 3. Risks

| Risk | Mitigation |
| --- | --- |
| Abuse drains the budget | A hard cap before the model call, the per-visitor limit, single-turn questions and bounded tokens. The worst case is that the assistant stops for the rest of the month and says so |
| A visitor types personal data into a question | It is never stored. It is processed in the EU (decision 2), and the privacy line tells the visitor exactly what happens |
| Prompt injection, or requests to talk about other things | Retrieved chunks are data inside a fixed prompt; the refusal path covers out-of-scope questions; the planted injection case and new injection questions are in the gate |
| The assistant invents experience | The grounding guardrail; the corpus is only approved copy; answers speak about Jesus in the third person; unanswerables are held at 0 |
| The service is down or slow | The palette keeps working as navigation; the ask mode shows the email action after a timeout |
| Cold starts | Measured in 005b; a minimum instance is an explicit cost decision |
| The Vertex price or regional availability differs | Checked at the start of 005a, before the model choice is confirmed |

## 4. Decisions

**⚠️ Pending — 1, hosting.** Recommended: Cloud Run in `europe-west8`.

**⚠️ Pending — 2, provider and model.** Recommended provider: Claude on Vertex AI, `eu`.
Model: Jesus's choice among the three in the table, confirmed with the 005a evaluation.

**⚠️ Pending — 3, retrieval.** Recommended: hybrid BM25 + local multilingual embeddings,
evaluation set first, with a query rewrite as the fallback.

**⚠️ Pending — 4, budget and rate limit.** Recommended: a Firestore spend counter checked
before each call; 10 questions per visitor per day on a salted, daily-rotating IP hash.

**⚠️ Pending — 5, corpus.** Recommended: the site build emits `ask-corpus.json` by section,
and the service fetches it at startup.

**⚠️ Pending — 6, target.** Recommended: ≥ 80% of natural answerable questions answered with
a correct citation, in both languages; 0 unanswerable or injection questions answered.
