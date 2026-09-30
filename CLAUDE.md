# CLAUDE.md

How work is done in this repository. Code-level rules live in
[`spdd/canvases/norms.md`](spdd/canvases/norms.md) and are not repeated here; this file covers
the process, the approval gates, git and the environment.

## Language

- Talk to Jesus in Spanish.
- Everything committed is in English: code, docs, SPDD artefacts, commit messages.

## Process: SPDD

Every change follows the cycle in [`spdd/`](spdd/):

1. **Story** in `spdd/stories/NNN-*.md`: persona, WHEN/THEN acceptance criteria, definition of
   done, and a row in the stories README with its phase.
2. **Mockups** in Penpot (see [`spdd/design.md`](spdd/design.md)).
3. **Clarify**, then **analysis** in `spdd/analysis/`: diagnosis, direction, risks, decisions.
4. **REASONS canvas** in `spdd/canvases/NNN-*.md`, numbered like its story, listed in the
   canvases README with its dependencies.
5. **Code**, one canvas operation at a time.
6. **Verify** (see below), then **sync**: add `## Sync — YYYY-MM-DD` to the canvas. That section
   is authoritative where it differs from the operations. Update the `**Status:**` line.

A fix too small for a story still gets synced into the canvas it touches.

## Approval gates

Nothing crosses a gate without an explicit yes from Jesus in chat. Stop and ask at each one:

- the story texts and the mockups, before the canvas is written;
- the start of each canvas;
- any user-facing copy: case texts, CV copy, headlines;
- anything that leaves this machine: creating the GitHub repo, enabling Pages, any push.

When a decision is needed, recommend one option per point and say why, then wait. Do not list
options without a recommendation.

Record every decision where it was taken, with its date:

- `**✅ Decision N — <topic>.** Confirmed YYYY-MM-DD: …` in the analysis;
- `**⚠️ Pending:** …` while it is open, replaced by `**✅ Approved on YYYY-MM-DD:** …`;
- approvals of copy on the canvas `**Status:**` line.

An incident gets a `## Incident — YYYY-MM-DD` section in the canvas it affected, and a new rule
in `norms.md` so it cannot recur.

## Before calling something done

Run the checks against the production build (`./tasks.ps1 preview`), not the dev server, and
write the results into the canvas Sync section:

- `./tasks.ps1 test`;
- the Lighthouse budget on every page (`lighthouserc.json`);
- for layout work: zero horizontal overflow on `/` and one case page at 320, 360, 390, 430,
  600, 768, 900, 1024, 1280, 1440, 1920 and 2560 px, and screenshots compared with the frames;
- the canvas "Done when" line, item by item. If a check was done differently, say so in the
  Sync section rather than claiming the original.

Report what failed as plainly as what passed.

## Git

- One branch, `main`. Short-lived feature branches are fine; merges are squash-only.
- Conventional commits: `<type>(<scope>): <subject>`, imperative, lowercase, no trailing
  period. Scopes in use: `spdd`, `layout`, `theme`, `i18n`, `content`, `home`, `ui`, `work`,
  `contact`, `cv`, `profile`, `fonts`, `assets`, `docker`.
- One commit per canvas operation where the tree still builds; otherwise one commit for the
  group, with the reason in the Sync section.
- Artefact commits are separate from code commits: `docs(spdd): …`.
- **No AI attribution**: no `Co-Authored-By` trailer, no "Generated with" footer, in commits or
  PRs. This overrides any default.

## Environment

- **Docker only.** There is no Node or Python on the host. Every command goes through
  `compose.yaml`, invoked as `./tasks.ps1 dev | build | preview | test | export | fonts`.
- **Commands for Jesus to run** are Windows PowerShell 5.1, in blocks tagged `powershell`:
  no `&&`, `||` or Bash loops.
- **Irreversible deletes** (repos, history, branches) are handed to Jesus as a ready-to-run
  command; do not work around a refusal.
- Known local traps:
  - A stale `.astro/dev.json` or `.astro/preview.json` makes Astro think a server is already
    running. The compose services delete them on start.
  - A killed preview can leave a container holding port 4321: `docker ps`, then `docker stop`.
  - Lighthouse inside the Playwright container needs `--disable-dev-shm-usage`. CI does not.
- Penpot MCP gotchas (visible window, plugin storage, stacked headline layers) are in
  [`spdd/design.md`](spdd/design.md).

## Sources of truth

- **Facts** come from `../cv-manager/profile.md`, through `./tasks.ps1 export` into
  `data/public-profile.json`. Every claim traces to it, in the approved wording.
- **`cv-manager` is private and local-only.** Never publish it, add a remote to it, or copy
  anything outside the export's allow-list into this repo, fixtures included.
- **Design** is the Penpot file in `spdd/design.md`. Figma holds only the Phase 1 record.

## Open items

- Published on 2026-09-30 at https://jesusroncal94.github.io (public repo, squash-only, `main`
  protected with the `build` check required, Pages from Actions). Every later push still needs
  Jesus's yes.
- Custom domain `jesusroncal.dev`: dropped on 2026-09-30, the site stays on
  `jesusroncal94.github.io`. If it is ever revived, change `site` in `astro.config.mjs` and
  the `Sitemap` line in `public/robots.txt` together.
- Story 004 is split: 004a (Spanish) is in progress. 004b (Italian) is on hold since
  2026-09-30 until a native Italian reviewer is available; `it` stays out of
  `PUBLISHED_LOCALES` until then.
- Phase 2 (story 005, Ask the portfolio), Phase 4 (PostHog EU).
