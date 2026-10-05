# 010 — Ship without waiting

**As** Jesus, the owner, who publishes every change through a pull request
**I want** the checks on a change to finish in minutes, not a quarter of an hour
**So that** I can review, merge and see a fix live in one sitting, without lowering any of
the guarantees the checks give today

## Evidence (12 runs, 2026-10-03 to 2026-10-05)

| Step | Typical time | Share |
| ---- | ------------ | ----- |
| Set-up, checkout, Node, `npm ci` | 10–20 s | ~3 % |
| `npx playwright install --with-deps chromium` (the build renders the CV PDF and the preview cards) | 19–33 s | ~4 % |
| `npm run test` | 1–2 s | < 1 % |
| `npm run build`, with the link and preview checks | 12–17 s | ~3 % |
| **Lighthouse budget**: 14 URLs × 3 runs = 42, one after another | **7 min 15 s – 8 min 10 s** | **~87 %** |
| Deploy to Pages | ~10 s | ~2 % |
| **Whole run** | **8.5–9.5 min** | |

- Every change runs the whole workflow twice, on the pull request and again on `main` after
  the merge, with the same files: about 17–18 minutes of checks before it is live.
- Four of the last five merged pull requests (#4, #7, #8, #9) changed only SPDD documents,
  and each still waited about 8 minutes for Lighthouse on a site that had not changed.
- The 42 Lighthouse runs spend 266 s auditing but take 464 s of wall time: the rest is a
  fresh browser and server per run. Each run also takes about 1.2 s for a full-page
  screenshot that no assertion reads.
- The repository is public, so runner minutes cost nothing: running checks side by side
  changes the wait, not the bill.

## Acceptance criteria

- WHEN a pull request changes anything that can affect the published site
  THEN the required check runs the tests, the build with its link and preview checks, and the
  Lighthouse budget on all 14 published URLs, 3 runs each, with the same assertions as today,
  and finishes in at most 4 minutes
- WHEN a pull request changes only documentation that does not reach the site (SPDD
  artefacts, `README.md`, `CLAUDE.md`)
  THEN the tests and the build still run, Lighthouse is skipped, and the required check
  finishes in at most 2 minutes
- WHEN any part of the checks fails
  THEN the required check fails: a failure, a cancellation or a skipped job never reports as
  a pass
- WHEN a change reaches `main`, through a merge or a direct push
  THEN the same checks run before anything is deployed, and nothing is published if they fail
- WHEN a new page or locale is published
  THEN it cannot drop out of the Lighthouse audit: the coverage test still asserts that the
  audited URLs equal the published pages

## Definition of done

- The branch protection on `main` keeps requiring the same `build` check, with no change to
  the repository settings
- Measured on real runs: a pull request that changes the site, one that changes only
  documentation, and the deploy after a merge, each within its limit
- A deliberately failing Lighthouse assertion, in a throwaway pull request that is closed
  unmerged, turns the required check red
- The Lighthouse results are still uploaded as one downloadable artifact per run
- The tests and the build checks pass, and the canvas Sync records the measured times
