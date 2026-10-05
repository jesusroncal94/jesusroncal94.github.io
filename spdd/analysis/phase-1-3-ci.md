# Analysis — Phase 1.3: Ship without waiting

Step 3 of the SPDD flow for story [010](../stories/010-ship-without-waiting.md), approved on
2026-10-05. Inputs: the story's evidence (12 runs, 2026-10-03 to 2026-10-05),
`.github/workflows/deploy.yml`, `lighthouserc.json`, `tests/lighthouse-urls.test.ts`, the
Lighthouse reports of run `37134332567`, and the source of `treosh/lighthouse-ci-action@12.6.2`.
There are no mockups: nothing visible changes.

## 1. Diagnosis

| Piece | Today | Consequence |
| ----- | ----- | ----------- |
| One job, `build` | Set-up, `npm ci`, Playwright, tests, build, Lighthouse, Pages artifact, in sequence | Lighthouse (~87 % of the run) waits for nothing and nothing waits in parallel |
| Lighthouse | 42 runs in one process: 266 s of auditing, 464 s of wall time | About 200 s go to starting a browser and a static server per run |
| Full-page screenshot | About 1.2 s per run, 42 times | No assertion reads it |
| Every change | Runs the whole workflow on the pull request and again on `main` | About 17–18 minutes of checks per change |
| Documentation-only changes | Same workflow | About 8 minutes of Lighthouse on an unchanged site, for half of recent changes |
| PR concurrency | `cancel-in-progress: false` for pull requests too | A push to an open pull request waits behind the run it makes obsolete |
| Branch protection | Requires the check named `build`, strict | Any restructuring must keep a job named `build` that means "everything passed" |

What the action does with its inputs (read in `src/index.js`): it passes `--config` and, if
given, one `--url` per entry in `urls`. Whether LHCI then replaces the config's list or adds
to it is not documented, and was not tested here. Rather than depend on it, each shard gets a
config file of its own, which is explicit.

## 2. Direction

### Decision 1 — Split Lighthouse into parallel jobs

| Option | Wall time of the audit | Verdict |
| ------ | ---------------------- | ------- |
| A. 4 jobs of 3–4 URLs | ~2.5–3 min each | Fits 4 minutes only with little margin, once the build job (~1 min) is added |
| **B. 7 jobs, one per page in both locales** (home, CV, four cases, privacy; 2 URLs × 3 runs) | **~1.2–1.5 min each** | **Recommended.** Total ~3 min. The job name says which page failed |
| C. 14 jobs, one per URL | ~1 min each | The fixed cost per job (start, download, browser) dominates; little gain over B for twice the jobs |

How B works:
- A first job, `site`, runs `npm ci`, Playwright, the tests and the build once, and uploads
  `dist/` as an artifact.
- A matrix job, `lighthouse`, with `shard: [0..6]`, downloads `dist/` and writes its own
  config with `jq`, keeping the URLs whose position in `lighthouserc.json` modulo 7 equals the
  shard. The list holds the 7 English pages and then the same 7 in Spanish, so each shard gets
  one page in both locales. The assertions, the runs and the settings come from the same file.
- Every URL lands in exactly one shard by construction, and `tests/lighthouse-urls.test.ts`
  keeps asserting that the file lists every published page. A new page joins a shard without
  touching the workflow.
- Each shard uploads `lighthouse-results-<shard>`, and one step merges them into a single
  `lighthouse-results` artifact (`actions/upload-artifact/merge`), so `gh run download <id>
  -n lighthouse-results` keeps working.

What does not change: 14 URLs, 3 runs, median-run aggregation, every assertion. Each URL's
three runs still share one machine, as today.

### Decision 2 — Skip Lighthouse when only documentation changes

- The `site` job computes `docs_only` with `git diff --name-only` between the base and the
  head: the pull request's base, or the previous commit of the push.
- It is true only if **every** changed path is under `spdd/`, or is `README.md` or `CLAUDE.md`.
  Anything else, a missing base (a new branch, a manual run) or an empty diff gives false,
  so an unknown case always runs the full audit.
- The tests and the build always run: `tests/review.test.ts` reads `spdd/reviews/`, and the
  build costs 15 s.
- The workflow-level `paths` filter is not used. With it, a documentation-only pull request
  would never report the required `build` check and could not be merged.

### Decision 3 — A gate job named `build`

- The jobs become `site`, `lighthouse` (the matrix) and `build`, which `needs` both and runs
  with `if: always()`.
- `build` fails unless `site` succeeded and `lighthouse` either succeeded or was skipped
  because `docs_only` is true. A failed, cancelled or unexpectedly skipped job fails it. This
  matters because GitHub counts a skipped required check as passed.
- `deploy` needs `build`, as today, and still runs only outside pull requests. The branch
  protection keeps requiring `build`, with no settings change.

### Decision 4 — Drop the full-page screenshot

`collect.settings.disableFullPageScreenshot: true` in `lighthouserc.json`. It saves about
1.2 s per run and shrinks the reports. Nothing asserts on it; the regular filmstrip and the
LCP element are still recorded.

### Decision 5 — Cancel superseded pull request runs

`cancel-in-progress` becomes true for pull requests only. A new push to an open pull request
stops the old run. Runs on `main` keep queueing without cancellation, so a deploy is never cut
off halfway.

### Decision 6 — What stays as it is

- **The checks on `main` after a merge stay.** Branch protection does not stop a direct push
  by an admin, so that path needs the same checks before deploying (story criterion 4).
- **14 URLs and 3 runs stay.** Fewer would weaken the budget, and the coverage test exists
  because pages once dropped out of the audit (canvas 004a).
- **Playwright is not cached.** A browser cache would save 10–15 s, but the system packages
  still install every run, and the `site` job already fits its share of the time.

### Expected times

| Change | Today | Expected |
| ------ | ----- | -------- |
| Pull request that changes the site | 8.5–9.5 min | ~3 min: `site` ~1.1 min, then 7 shards ~1.5 min, then the gate |
| Pull request with documentation only | 8.5–9.5 min | ~1.3 min |
| From merge to live | 8.5–9.5 min | ~3.2 min (docs only: ~1.5 min) |
| Whole change, pull request plus `main` | ~17–18 min | ~6.5 min (docs only: ~3 min) |

These are estimates from the step timings; the canvas Sync records the measured ones.

## 3. Risks

| Risk | Mitigation |
| ---- | ---------- |
| The gate reports success after a failure, because skipped required checks count as passed | The gate checks each job's result explicitly. The definition of done includes a throwaway pull request with a broken assertion, closed unmerged, that must turn `build` red |
| A site change is classified as documentation and skips Lighthouse | A strict allow-list of three paths; anything unknown runs the full audit. `src/content/**/*.md` is site content and is not on the list |
| Different shards run on runners of different speed | Each URL's median comes from three runs on one machine, as today; today's single job already lands on a random runner |
| More jobs queue for runners | A free account runs up to 20 jobs at once; this workflow runs at most 7 at the same time |
| The merged artifact or the gate adds steps that fail on their own | Both are first-party actions or plain shell, and a failure there turns the check red rather than green |

## 4. Decisions

**✅ Decision 1 — Parallel Lighthouse.** Confirmed 2026-10-05: B, 7 shards, one page in both locales
each, from one build, with a per-shard config written by `jq` and one merged artifact.

**✅ Decision 2 — Documentation-only changes.** Confirmed 2026-10-05: skip Lighthouse when every
changed path is under `spdd/` or is `README.md` or `CLAUDE.md`; tests and build always run.

**✅ Decision 3 — The gate.** Confirmed 2026-10-05: jobs `site`, `lighthouse` and a gate named `build`
that checks every result explicitly; no change to the branch protection.

**✅ Decision 4 — Full-page screenshot.** Confirmed 2026-10-05: disabled.

**✅ Decision 5 — Superseded runs.** Confirmed 2026-10-05: cancelled on pull requests only.

**✅ Decision 6 — What stays.** Confirmed 2026-10-05: keep the checks on `main`, the 14 URLs and
3 runs, and an uncached Playwright install.
