---
order: 1
roleId: intercorp-management-innova-latam
organisation: Intercorp
role: AI Engineer
title: 'Evals before vibes: fixing a prompt that drifted'
summary: LLM-as-judge fixtures across 5 dimensions and 19 items turned prompt changes into a measured release gate. Output tokens fell ~71% on bloated cases.
before: 45.6%
after: 100%
stack: [Gemini 2.5 Pro, Spring AI, LLM-as-judge]
keywords: [evals, prompt, quality, tokens, gemini, lesson plans, eval process]
---

## Problem

I own the production LLM system that generates curriculum-aligned lesson plans for teachers
in Peru, Colombia and Mexico, running on Gemini 2.5 Pro through Vertex AI. A lesson plan is
only useful if it follows the structure its national curriculum defines, section by section.

Measured against that structure, only 45.6% of the outputs conformed. Some responses were
also bloated, spending tokens on text nobody had asked for. The cure for that is not a
better-sounding prompt. It is a way to measure one.

## Approach

I built a set of test fixtures and an LLM-as-judge rubric that scores every output on 5
dimensions and 19 items. Each prompt change now produces a number that can be compared with
the last one, instead of an impression.

Prompts became versioned artefacts with semantic versions, so a change is a release with a
number rather than an edit in place. In the same system, the unit-generation engine I
shipped keeps checks that do not need a model out of the model: deterministic guardrails
validate the structure and detect truncated output without a single extra LLM call. And every
call reports its tokens, cost and latency, so a change that
improves quality but doubles the bill is visible on the dashboard before it becomes a
surprise.

## Result

Structural conformance went from 45.6% to 100%, and output tokens fell by about 71% on the
cases that had been bloated.

The lasting change is in how prompts ship. A new version is a measured release rather than an
opinion: the fixtures say whether it is better, and the dashboards say what it costs.
