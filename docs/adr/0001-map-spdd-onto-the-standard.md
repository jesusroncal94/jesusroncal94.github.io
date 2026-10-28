# 0001 Map SPDD onto the AI delivery standard

- Status: proposed
- Date: 2026-10-28

## Context

The portfolio adopted the AI delivery standard on 2026-10-28 (profile `site`, target L2). The
standard expects specs in `docs/specs/`, acceptance entries in `acceptance/features.json` and a
spec skill. This repository already runs Structured-Prompt-Driven Development: 23 stories, their
analyses and REASONS canvases in `spdd/`, with approval gates and Sync sections.

## Options

| Option | For | Against |
|---|---|---|
| Replace SPDD with the standard's specs | One spec format across the portfolio | Loses the canvases and their history; the site documents SPDD as its process |
| Map SPDD onto the standard | Keeps the process and its record; the checker still passes | Two vocabularies for the same thing |

## Decision

Map. Stories and canvases stay the specs; `docs/specs/README.md` points to them, and
`acceptance/features.json` indexes each story's WHEN/THEN criteria by reference (`S-NNN`) instead
of copying them, so the story stays the single source. The existing `build` check and Lighthouse
budget stay; the standard's `standard` workflow runs beside them.

## Consequences

- Changing a story's criteria changes the acceptance entry's meaning without touching the JSON,
  so story criteria are reviewed with the same care as the JSON (human gate either way).
- `passes` was set from the canvases' recorded verification on adoption, not from a fresh run.

## Revisit when

The standard ships a spec format that can carry SPDD's canvas, or the stories' criteria get
automated end-to-end tests that the acceptance entries could name directly.
