---
order: 4
roleId: mindfortress-inc
organisation: MindFortress
product: Freya
role: Tech Lead
title: A writing partner that never loses the plot
summary: Co-architected an AI writing partner around an "hourglass" model (many input channels, one facts-only knowledge base, prose generation) and hardened its AI layer for production.
before: 7 agents
after: 1 story graph
stack: [FastAPI, pgvector, Yjs / CRDT]
keywords: [freya, agents, multi-agent, knowledge graph, architecture, crdt, writing, hourglass]
---

## Problem

Freya is an AI writing partner for novelists. A novel is long, and the facts that hold it
together are spread across hundreds of pages. A writing partner that loses track of any of
them becomes one more thing the author has to check.

That makes consistency the core requirement, not a feature: every suggestion has to agree
with the book so far.

## Approach

As Technical Lead, I co-architected Freya's AI layer and wrote its architecture model, the
"hourglass": many ways in, one source of truth, prose on the way out.

Authors feed the story in through several channels: voice-first creation, guided questions,
character interviews and manuscript import. Inbound subagents extract, summarise and structure
what comes in, and the result goes into a single knowledge base that holds only facts. Prose
generation draws on that base. Outbound subagents generate, validate and enrich the result,
which closes the loop.

The team built the platform on that model:

- seven specialised chat agents with retrieval over the story bible;
- a guard pipeline after every generation;
- a knowledge graph with 33 relation types, including epistemic "who knows what" tracking;
- real-time co-editing on Yjs CRDTs over WebSocket.

Underneath is a FastAPI backend with more than 900 endpoints, 180+ data models and pgvector,
integrating Claude (Sonnet and Opus) and OpenAI models.

My own code made that layer hold up in production:

- one model router across the agents, including content-policy-aware routing;
- per-project isolation and authorisation on chat and manuscript lookups;
- sanitised streaming errors;
- real token and cost tracking on streaming;
- blocking AI calls moved off the event loop.

## Result

Many ways in, one store of facts, prose on the way out: the shape Freya's AI layer was built
on, made ready for production.

I would make the same choice again for any assistant that has to stay consistent over a long
document: a narrow waist. Whatever the input, it becomes facts first, and generation reads only
from those.
