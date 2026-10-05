# 010 — Ship without waiting

Story: [010](../stories/010-ship-without-waiting.md). Analysis:
[Phase 1.3](../analysis/phase-1-3-ci.md). No frames: nothing visible changes.

**Status:** written on 2026-10-05; the story and decisions 1–6 were approved that day.
Waiting for the start.

## R — Requirements

The checks on a change finish in minutes and guard exactly what they guard today.

- A pull request that can affect the site runs the tests, the build with its link and preview
  checks, and the Lighthouse budget on all 14 URLs × 3 runs, in at most 4 minutes.
- A documentation-only pull request runs the tests and the build, skips Lighthouse, and
  finishes in at most 2 minutes.
- The required check `build` fails whenever any part fails, is cancelled or is skipped when it
  should have run.
- Everything that reaches `main` passes the same checks before it deploys.

**Done when:**
- The branch protection still requires `build`, unchanged.
- Measured on real runs: a site pull request, a documentation-only pull request and the
  deploy after a merge, each within its limit.
- A throwaway pull request with a broken assertion, closed unmerged, turns `build` red.
- One `lighthouse-results` artifact per run still holds every report.
- Tests and build checks pass; this canvas's Sync records the measured times.

## E — Entities

```ts
isDocumentationOnly(paths: readonly string[]): boolean   // every path under spdd/, or README.md, or CLAUDE.md; false when empty
```

Workflow jobs:

| Job | Runs | Needs | Output |
| --- | ---- | ----- | ------ |
| `site` | always | — | `docs_only`; the `dist` artifact; the Pages artifact outside pull requests |
| `lighthouse` (matrix `shard: [0..6]`) | unless `docs_only` | `site` | `lighthouse-results-<shard>` |
| `build` (gate) | always | `site`, `lighthouse` | pass or fail; the merged `lighthouse-results` |
| `deploy` | outside pull requests | `build` | the Pages deployment |

## A — Approach

Decisions 1–6 of the analysis.

1. **Build once, audit in parallel.** `site` builds `dist/` and uploads it. Seven `lighthouse`
   jobs each audit one page in both locales, chosen by position in `lighthouserc.json` modulo
   the matrix size (`strategy.job-index`, `strategy.job-total`), so the list in that file stays
   the only list.
2. **Skip only what cannot change.** The scope is computed from `git diff` against the pull
   request's base or the push's previous commit. Unknown cases run everything.
3. **One gate keeps the old name.** `build` reads each job's result and fails on anything but
   the expected outcome, so the branch protection needs no change.

## S — Structure

```
src/lib/ci-scope.ts            isDocumentationOnly
scripts/ci-scope.ts            reads the base and head, runs git diff, writes docs_only
tests/ci-scope.test.ts
lighthouserc.json              + collect.settings.disableFullPageScreenshot
.github/workflows/deploy.yml   site, lighthouse (matrix), build (gate), deploy
README.md                      "Deploying" brought up to date
```

## O — Operations

1. **`isDocumentationOnly` and `scripts/ci-scope.ts`.**
   - The function returns true when the list is not empty and every path starts with `spdd/`
     or equals `README.md` or `CLAUDE.md`.
   - The script takes the base from `CI_BASE` and the head from `GITHUB_SHA`. With no base, an
     all-zero base, or a base that is not in the clone, it writes `docs_only=false`. Otherwise
     it writes the function's answer for `git diff --name-only <base> <head>` to
     `GITHUB_OUTPUT`, and prints the paths it judged.
   - Test: a documentation-only list, a list with one site file (`src/content/...md`), and an
     empty list.
2. **Lighthouse settings.** `collect.settings.disableFullPageScreenshot: true`. The assertions,
   the URLs and the runs do not change, and `tests/lighthouse-urls.test.ts` still passes.
3. **The workflow.**
   - `concurrency.cancel-in-progress` is true for pull requests only.
   - `site`: checkout with full history, Node 24 with the npm cache, `npm ci`, the scope step,
     Playwright, tests, build, upload `dist`, and the Pages artifact outside pull requests.
   - `lighthouse`: `if: needs.site.outputs.docs_only != 'true'`, `fail-fast: false`. Checkout,
     download `dist`, write `lighthouserc.shard.json` with `jq`, run
     `treosh/lighthouse-ci-action@12.6.2` with that config and
     `artifactName: lighthouse-results-<shard>`.
   - `build`: `needs: [site, lighthouse]`, `if: always()`. A shell step fails unless `site` is
     `success` and `lighthouse` is `success`, or `skipped` with `docs_only` true. Then, when
     Lighthouse ran, `actions/upload-artifact/merge@v7` joins the shards into
     `lighthouse-results`, whatever their outcome, so a failure stays diagnosable.
   - `deploy`: unchanged, `needs: build`.
4. **README.** "Deploying" says what runs on a pull request and on `main`, that Lighthouse runs
   in seven parallel jobs and is skipped for documentation-only changes, and lists the budget
   as it is: the third-party limit is one request, the analytics endpoint, since Phase 4.
5. **Check.**
   - Locally: tests, the build, and `actionlint` on the workflow in a container.
   - In CI, on this canvas's own pull request, which changes the site's checks: every job
     green, one merged artifact with 42 reports, and the measured times.
   - A documentation-only pull request (the Sync of this canvas) measures the short path.
   - A throwaway pull request that sets the LCP limit to 1 ms must turn `build` red; it is
     closed unmerged and its branch deleted.
   - The deploy after the merge measures the path to the live site.

## N — Norms

All of [norms.md](norms.md). In particular:
- "A performance claim is measured where it is enforced": every time in the Sync comes from a
  real Actions run, not from an estimate.
- "Tests cover the happy path": the scope function's three cases.
- Conventional commits: CI and build changes keep the unscoped `ci:` and `build:` used so far.

## S — Safeguards

- No assertion, URL or run count of the Lighthouse budget is relaxed.
- A skipped or cancelled job can never make `build` pass, except Lighthouse when the change is
  documentation only.
- The repository settings and the branch protection are not changed.
- No new third-party action: only `actions/*` and the action already in use.
