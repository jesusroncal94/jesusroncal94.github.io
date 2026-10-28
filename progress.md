# Progress

Newest entry first. At most five lines per session (ten for a handoff). Move older entries to `docs/progress-archive.md` when this file passes 5,000 tokens.

## Open items

- Story 004b (Italian) is on hold since 2026-09-30 until a native Italian reviewer is available.
- Story 005 (Ask the portfolio) is on hold since 2026-10-01; retrieval work continues in `rag-bm25-search`, and a fifth case study waits for a larger eval measured over several runs.
- Custom domain `jesusroncal.dev` dropped on 2026-09-30; the site stays on `jesusroncal94.github.io`.

## 2026-10-28 adopt the AI delivery standard

- Done: profile `site` at L2 from ai-delivery-standard v1.0.0; rules moved from `CLAUDE.md` to `AGENTS.md`; SPDD mapped (ADR 0001); `update-diagram` moved to `.agents/skills/`.
- Verified with: `ads check` and `./tasks.ps1 test` in Docker.
- Open issues: `ci-scope.ts` still treats `CLAUDE.md` and `.claude/skills/` as documentation, not `AGENTS.md`, `.agents/skills/` or `progress.md`.
- Next step: Jesus pushes, adds the `human-approved` label and requires the `standard` checks on `main`.
