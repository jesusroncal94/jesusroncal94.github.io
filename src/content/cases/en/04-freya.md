---
order: 4
roleId: mindfortress-inc
organisation: MindFortress
product: Freya
role: Tech Lead
title: A writing partner that never loses the plot
summary: Seven specialised agents over a knowledge-graph consistency engine with epistemic tracking, plus real-time co-editing over CRDTs, on a FastAPI backend with 800+ endpoints.
before: 7 agents
after: 1 story graph
stack: [FastAPI, pgvector, Yjs / CRDT]
keywords: [freya, agents, multi-agent, knowledge graph, architecture, crdt, writing]
---

## Problem

Freya is an AI writing partner for novelists. A novel is long, and the facts that hold it
together are spread across hundreds of pages. A writing partner that loses track of any of
them becomes one more thing the author has to check.

That makes consistency the core requirement, not a feature: every suggestion has to agree
with the book so far.

## Approach

I architected Freya's AI layer around a single consistency engine for the story.

At its centre is a knowledge graph with 33 types of edges and epistemic tracking on top. Seven
specialised agents sit over that engine, so what they produce is checked against one shared
model of the story rather than against seven separate memories.

Writing is collaborative, so the editor is too. Real-time co-editing runs on Yjs CRDTs over
WebSocket, which lets concurrent changes merge without conflicts. Underneath is a FastAPI
backend with more than 800 endpoints and pgvector, integrating Claude (Sonnet and Opus) and
OpenAI models.

## Result

Seven agents, one story graph and an editor several people can write in at once: the
architecture of Freya's AI layer.

The design choices are the ones I would make again for any assistant that has to stay
consistent over a long document — one shared graph with typed relationships, and agents with
narrow roles on top of it.
