# 010 — Ship without waiting

Story: [010](../stories/010-ship-without-waiting.md). Analysis:
[Phase 1.3](../analysis/phase-1-3-ci.md). No frames: nothing visible changes.

**Status:** implemented on 2026-10-05 (#10), start approved that day with the story and
decisions 1–6; synced below. The documentation-only path is measured on the pull request that
carries this Sync.

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

## Sync — 2026-10-05 (operations 1–5)

This section is authoritative where it differs from the operations above.

- **Op 1** (`1352cdc`). `scripts/ci-scope.ts` checks the base with `git cat-file -e` silently,
  so a missing base reads as "run everything" without a `fatal:` line in the log; errors from
  `git diff` itself still show. Tried in a container against real history: #9's range gives
  true, #5's gives false, and an all-zero, unknown or missing base gives false.
- **Op 2** (`64e87e3`). All 42 reports of the first parallel run carry
  `disableFullPageScreenshot: true` and no full-page screenshot. The mean run went from
  6.3 s to 5.5 s.
- **Op 3** (`75f07fe`).
  - The scope step runs after `npm ci`, because it uses `tsx`.
  - `jq` 1.7 is already on the runner. A local check split the 14 URLs into 7 shards of one page
    in both locales, every URL exactly once, each shard with the same runs, settings and six
    assertions.
  - The shard reports are merged with `separate-directories: true`: `lighthouse-results` holds
    one folder per shard, because seven `assertion-results.json` files would otherwise
    overwrite each other. `gh run download <id> -n lighthouse-results` still works.
  - `actionlint` 1.7.12 (`rhysd/actionlint`, pulled with Jesus's yes) reported nothing.
- **Op 4** (`bd9926f`). The README's "Deploying" section also corrects the third-party line,
  which still said "no third-party requests" after Phase 4.
- **Commits.** One per operation; the pull request #10 was squash-merged as `c17d4af`.

**Verified on 2026-10-05, on real Actions runs:**

| Run | Path | Time | Limit |
| --- | ---- | ---- | ----- |
| `37324631829`, pull request #10 | Site change: `site` 1 min 4 s, 7 shards 1 min 16 s – 1 min 43 s in parallel, gate 9 s | **3 min 7 s** | 4 min |
| `37326266401`, throwaway #11 | LCP limit set to 1 ms | 3 min 2 s, **`build` red** | — |
| `37327505669`, `main` after the merge | Site change, then the deploy | **3 min 6 s** from merge to live | — |

Before this canvas every run took 8.5–9.5 min, and a change about 17–18 min across its pull
request and `main`; a site change now takes about 6 min 15 s across both.

- **The gate.** On #11 every shard failed with exactly two `largest-contentful-paint`
  assertions, its two URLs, and no other. The gate logged
  `site: success, lighthouse: failure, documentation only: false` and exited 1; `deploy` was
  skipped. The merged artifact still held the 42 reports. #11 was closed unmerged; deleting
  its branch `ci-gate-check` is handed to Jesus, per CLAUDE.md.
- **The scope on real events.** #10 compared against its base, `282e4f5`, listed the 11
  changed paths and ran the full audit. The push to `main` compared against `main`'s previous
  commit, the same `282e4f5`, and did the same.
- **The budget is unchanged.** All 14 URLs pass in both full runs: median LCP 1354–1363 ms,
  CLS at most 0.004, accessibility 1. The serial run of #5 measured 1356–1366 ms.
- **Seen and kept in view: single-run performance dips.** In #10, four single runs scored
  0.95–0.99 (home, CV, cases 02 and 04), with total blocking time of 97–272 ms against under
  5 ms otherwise: CPU contention on a runner, not the page. Every median stayed 1, which is what
  the budget asserts. The `main` run had none: all 42 runs scored 1, with at most 30 ms of
  blocking time. If medians start to dip, the next step is to compare runner hardware in the
  reports before touching the budget.
- **Branch protection** still requires `build`, unchanged; no repository setting was touched.
- **Tests:** 273 pass, including the three for `isDocumentationOnly`.

**Done when, item by item:**
- Branch protection unchanged: yes.
- Site pull request within 4 min (3 min 7 s) and the deploy after a merge (3 min 6 s): yes.
  The documentation-only path (limit 2 min) is measured on this Sync's own pull request and
  recorded below once it has run.
- A throwaway pull request with a broken assertion turned `build` red: yes, #11.
- One `lighthouse-results` artifact per run with every report: yes, one folder per shard.
- Tests and build checks pass: yes.
