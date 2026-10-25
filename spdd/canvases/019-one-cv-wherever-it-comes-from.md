# 019 — One CV, wherever it comes from

Story: [019](../stories/019-one-cv-wherever-it-comes-from.md). Analysis:
[Phase 1.8](../analysis/phase-1-8-canonical-cv.md). Mockup: the CV rendering described in
[../design.md](../design.md) (no Penpot frame; the CV's design lives in `cv.astro`).

**Status:** implemented on 2026-10-14. On 2026-10-13 the story, the mockup (revised the same
day), decisions 1–6, the publication of every `cv-base.md` bullet as it is, the canvas start and
the Spanish translation of the summary and 24 bullets were approved. Published with #35. Done on
2026-10-14, story 019 closed after the check on the published site. On 2026-10-23 the Spanish of
the re-verified Intercorp role was approved. On 2026-10-26 the Spanish of the re-verified
MindFortress role and the new summary sentence was approved.

## R — Requirements

The site's CV shows the summary and role bullets of `cv-manager/cv-base.md`, word for word in
English and as reviewed translations in Spanish. They arrive through the export, which reads
nothing else from that file and lets nothing private through. The layout keeps both PDFs at two
pages, and the build enforces it.

**Done when:**
- The export tests pass:
  - summary, bullets, role matching and bold removal on a synthetic fixture;
  - the fixture's phone numbers and private note never reach the output.
- `data/public-profile.json`, re-exported, carries the summary and the 24 bullets, and nothing
  else from `cv-base.md`.
- The English PDF's text matches `cv-base.md` section by section, apart from the contact line.
- The Spanish CV has a reviewed pair for every exported text.
  - Removing a pair fails the build.
  - Changing an exported English text fails the build.
- Both PDFs are two pages, and a three-page CV fails the build.
- Locally, `./tasks.ps1 test` fails on a stale export, and in CI it reports the check as skipped.
- Screenshots of both PDFs match the mockup's layout.
- Tests pass; Lighthouse passes in CI on `/cv/` and `/es/cv/`; no other page changes.

## E — Entities

```ts
// src/lib/profile/schema.ts
publicProfileSchema: … + summary: string; roles[]: … + bullets: string[] (min 1)

// src/lib/profile/parse.ts
parseCv(markdown: string): { summary: string; bullets: Map<roleId, string[]> }
// reads only "## Summary" and "## Experience"; strips comments and **bold**;
// throws on a phone pattern or an email other than the profile's
mergeCv(profile, cv): PublicProfile            // throws on a role in one file and not the other

// src/content.config.ts, site.cv (Spanish only)
cv: { summary: { source, text }, bullets: { source, text }[] }
// English pages read the profile; Spanish pages look each exported text up by `source`
```

## A — Approach

Decisions 1–6 of the analysis: the export carries the CV text, the English page renders it, the
Spanish page renders reviewed pairs keyed by their English, and the build guards page count,
missing or stale translations, and (locally) freshness.

## S — Structure

```
src/lib/profile/{parse,schema}.ts        + parseCv, mergeCv, summary, bullets
scripts/export-profile.ts                + reads /cv-manager/cv-base.md
tests/fixtures/cv-base.md                new, synthetic, with fake phone numbers
tests/profile.test.ts                    + parseCv, mergeCv, the privacy guard on cv-base
data/public-profile.json                 re-exported
src/pages/[...locale]/cv.astro           exported text; Spanish pairs; the mockup's layout
src/content.config.ts                    site.cv becomes the Spanish pairs; English has none
src/content/site/{en,es}.yaml            en: cv block removed; es: pairs
scripts/render-artifacts.ts              + fails above two pages
tests/cv-translations.test.ts            new: every exported text has a pair, no pair is stale
tests/cv-freshness.test.ts               new: export equals a fresh parse of ../cv-manager, or skipped
compose.yaml                             test service: ../cv-manager read-only, when present
spdd/reviews/004a-es.md                  cv rows replaced by the pairs
```

## O — Operations

1. **The export.**
   - `parseCv` and `mergeCv`, the schema's new fields and the synthetic fixture with its tests;
     the export script reads `cv-base.md`.
   - Run `./tasks.ps1 export`.
   - Check: the tests pass, and the diff of `data/public-profile.json` adds only `summary` and
     `bullets`. The site does not read them yet, so it builds unchanged.
2. **The English CV and the layout.**
   - `cv.astro` renders the exported summary and bullets for English, with the mockup's type,
     margins and break rules.
   - `render-artifacts.ts` counts pages.
   - `en.yaml` loses its `cv` block, and the schema makes `site.cv` optional for this operation.
   - Check:
     - the English PDF is two pages and matches `cv-base.md`'s text;
     - with a third of the summary repeated three times, the build fails on page count;
     - the Spanish CV is unchanged apart from the layout.
3. **The Spanish translation.**
   - Draft the summary and 24 bullets in Spanish, reusing the reviewed highlights where the facts
     match.
   - **Jesus approves the text before it is committed.**
   - Then the pairs go into `es.yaml`, the schema requires them, and `cv.astro` looks the Spanish
     up by `source`. `cv-translations.test.ts` and the review rows are added.
   - Check:
     - the Spanish PDF is two pages;
     - removing a pair, and changing one English text in the data, each fail.
4. **Freshness.**
   - `cv-freshness.test.ts`;
   - the test service mounts `../cv-manager` read-only when it exists.
   - Check: with one bullet of a copy of the data changed, the local test fails; without the
     mount, it reports "skipped: cv-manager not available".
5. **Check,** on the production build: the Done-when list.

## N — Norms

All of [norms.md](norms.md), in particular "Nothing private reaches the repository",
"Truthfulness", and "A change of wording in `profile.md` is a change to the site", which this
story turns from a rule into a check for the CV.

## S — Safeguards

- No phone number, no `cv-manager` note and no contact field of `cv-base.md` in `data/`, `dist/`
  or any fixture with real values.
- The case studies, home page and every page other than `/cv/` and `/es/cv/` are unchanged.
- `cv-manager` is read, never written; nothing outside the allow-list is copied.

## Sync — 2026-10-14 (operations 1–5)

This section is authoritative where it differs from the operations above.

- **Op 1** (`7d17bfb`).
  - `parseCv` returns `{ summary, roles: { id, bullets }[] }`. It refuses a phone number, in
    international form or grouped local form, and any email address in the CV text.
  - `summary` and `bullets` are optional in the schema, so that `parseProfile` alone stays
    valid; `mergeCv` always sets them and fails on a role mismatch.
  - The first draft of the privacy test used one of Jesus's real numbers as its example. It was
    replaced with a fictitious one before anything ran or was committed. `git grep` finds neither
    real number in the repository.
  - The re-export added only `summary` and 24 bullets, and every page built byte-identical.
- **Op 2** (`9c97e10`).
  - English renders the export.
  - The mockup's layout: 9 pt / 1.4, margins 10/12 mm, `article` breakable, `li` unbreakable, and
    `.role` kept with what follows.
  - `pdfPageCount` in `src/lib/cv.ts`, with tests; `render-artifacts.ts` fails above
    `MAX_CV_PAGES`.
  - The page-count check:
    - with a third of the summary repeated three times, the CV still fits, since page 2 has a
      quarter free;
    - with the whole summary repeated four times, the build fails with "The en CV runs to 3
      pages; it must fit on 2".
- **Op 3** (`867f3a3`).
  - `src/lib/cv-text.ts` holds `cvSources`, `translationGaps` and `cvText`; `cvText` throws on a
    text without a translation, which stops the build.
  - The 25 pairs are in `es.yaml`, and the 25 review rows replace the old CV rows in
    `004a-es.md`.
  - With the pair for the video-metadata bullet removed, and with that bullet's English changed in
    the export, the build fails each time with "No reviewed translation for the CV text…".
  - The draft file was deleted after approval.
- **Op 4** (`be1dea6`).
  - `tests/cv-freshness.test.ts`; the test service mounts `../cv-manager` read-only.
  - A stale export fails with "data/public-profile.json is stale: run ./tasks.ps1 export".
  - Without `cv-manager`, the check is skipped with a warning. A first version added a
    placeholder test that passed in that case; it was removed, since a pass is what the
    requirement forbids.
- **Op 5.** The Spanish PDF left the `%` of "un 35 %" alone at the start of a line. The nine
  `%` in the Spanish CV texts now take a non-breaking space, as in the case diagrams. The text is
  unchanged, and the review rows still match, since the test normalises whitespace.

**Verified on 2026-10-14, on the production build:**
- Tests: 387 pass locally, the freshness check included.
- Build checks: links, previews and structured data valid on 15 pages.
- Both PDFs are two pages. The English one fills page 2 to about three quarters and the Spanish
  one to about nine tenths, each as in the mockup's layout.
- The English CV's 24 bullets and summary equal the export, in order. Each appears word for word
  in `cv-base.md`, and the PDF shows the same text.
- Privacy: no phone pattern, private note, deal-breaker or salary in `dist/` or `data/`. The only
  "WhatsApp" is the channel name in a MindFortress bullet.
- Against the build of `main` before this story, only `/cv/` and `/es/cv/` differ.
- Overflow: zero at all 12 widths on `/cv/` and `/es/cv/`.
- **CI,** pull request #35, run `38475976269`:
  - The test job printed "Export freshness skipped: /cv-manager is not available here." and
    reported 386 passed, 1 skipped, as designed.
  - Both PDFs rendered at two pages.
- **Lighthouse,** same run, 15 URLs × 3: every assertion passes. `/cv/` and `/es/cv/` have median
  performance 1, accessibility 1, LCP 1,354 ms and CLS 0. Three single runs scored below 1, each
  with a median of 1: `/cv/` 0.99, `/work/02-cost-leak/` 0.97 and `/work/03-merge-campaign/` 0.69.
  The last two pages did not change; this is the first-run runner noise seen before.

**Verified on the published site, 2026-10-14,** after #35 was merged (`dd5b795`) and deployed
(run `38476429256`, 3 min 28 s):
- Both published PDFs are two pages, byte for byte the size of the local build's.
- `/cv/` carries all 25 exported texts. `/es/cv/` carries the approved Spanish.
- Neither page has a phone pattern or a private note.

**Done when, item by item:**
- The export tests pass, and the re-export carries only the summary and 24 bullets.
- The English CV matches `cv-base.md`'s text, apart from the contact line.
- The Spanish CV has a reviewed pair for every text, and a missing pair or a changed English text
  fails the build.
- Both PDFs are two pages, and a three-page CV fails the build.
- The freshness check fails locally on a stale export and is skipped in CI with a warning.
- The PDFs match the mockup's layout.
- Tests and Lighthouse pass, and no other page changed.

**Story 019 is closed.**

## Sync — 2026-10-23 (the Intercorp role re-verified)

`cv-manager` `5051d8c` renames the Intercorp heading to "AI Engineer — Intercorp Management (NGR,
Innova LATAM), Peru - Remote" and rewrites its six bullets; claims the evidence did not support
("led the migration", "19 custom nodes", "~71% output tokens") are gone.

- **Parser fix.** `parseRoles` split the employer on every ", ", so the comma inside "(NGR, Innova
  LATAM)" cut the organisation in two and pushed half of it into the location. It now splits only
  at the top level (`splitTopLevel`), and the fixtures carry the new heading so the test covers
  it.
- **Role id.** It is derived from the organisation without parentheticals, so it changed from
  `intercorp-management-innova-latam` to `intercorp-management`, in both `site/*.yaml` timelines
  and both case-01 files.
- **Export.** The local `cv-manager` checkout was three commits behind `5051d8c` and was not
  touched: `profile.md` and `cv-base.md` were taken from `5051d8c` with `git show` into a scratch
  folder and mounted for the export and the freshness check. Only the Intercorp role changed in
  `data/public-profile.json`.
- **Spanish.** The six new pairs replace the old ones in `es.yaml` and in the review rows;
  approved by Jesus on 2026-10-23. "+2,9 %" takes the non-breaking space of op 5. The heading needs
  no new text: the organisation is a name, and "Peru - Remote" already had its translation.

**Verified on 2026-10-23, on the production build:**
- Tests: 430 pass, the freshness check included, against `5051d8c`.
- Build checks: links, previews and structured data valid on 15 pages.
- Both PDFs are two pages. The Spanish one leaves about a sixth of page 2 free, the English one
  about a quarter.
- `/es/cv/` shows the new heading and the approved Spanish; `/es/work/01-evals/` no longer carries
  the token claim; no Spanish or English text on the site says "Lideré la migración", "19 nodos" or
  "71 %".
- Privacy: no phone pattern in `dist/` or `data/`; the only email is the public contact address,
  as before.
- Lighthouse and the overflow sweep were not run locally: the change is text only, and Lighthouse
  runs in CI on the pull request.

**Verified on the published site, 2026-10-23,** after #45 was merged (`136d201`) and deployed
(run `39869063140`):
- CI on #45: 16 checks passed, Lighthouse included; the deploy job was skipped on the pull
  request, as designed.
- Both published PDFs are byte for byte the size of the local build's, which rendered at two pages.
- `/cv/` and `/es/cv/` carry the new heading; `/es/cv/` carries the approved Spanish bullets.
- Neither `/es/cv/` nor `/es/work/01-evals/` says "Lideré la migración", "19 nodos" or "71 %", and
  `/work/01-evals/` no longer mentions the 71%.
- No phone pattern on the four pages checked.

## Sync — 2026-10-26 (the MindFortress role re-verified)

`cv-manager` `b1b133b` keeps the MindFortress heading and rewrites the role: six of its bullets
changed (the Freya "Co-architected" bullet did not), the role went from nine bullets to seven, and
the summary's last sentence now names "US, EU, LATAM, and Asia-Pacific teams". Claims the
evidence did not support are gone from the CV: "6-8 PRs/session", "112 PRs", "~$12-16/day to $0",
"verified $0 in the prod ledger", "11 flaky failures to 0", the Coordinator / Manager / Worker
system over 8 messaging channels, Stripe billing with A/B testing, the mindfortress-claude
"MCP integrations" list and "layered prod-ops authorization gates".

- **Export.** As on 2026-10-23, the local `cv-manager` checkout (four commits behind) was not
  touched: `profile.md` and `cv-base.md` were taken from `b1b133b` with `git show` into a scratch
  folder and mounted for the export and the freshness check. Only the summary and the MindFortress
  bullets changed in `data/public-profile.json`; the CV now has 23 bullets, so
  `tests/cv-translations.test.ts` expects 24 texts.
- **Spanish.** The summary pair and the six new bullet pairs replace the old ones in `es.yaml`;
  the review rows in `spdd/reviews/004a-es.md` were rebuilt in export order, unchanged texts
  keeping their approval date. Approved by Jesus on 2026-10-26.
- **The rest of the site.** The same claims were removed from cases 02 and 03 (see the
  2026-10-26 syncs of [canvas 017](017-see-where-the-money-went.md) and
  [canvas 015](015-see-how-the-queue-drained.md)) and from the home page: the Reeve metric reads
  "110+ PRs · 30 h", the cost metric "~$16/day" (traced and guarded, no longer "→ $0"), the
  palette question asks how the leak was traced, the ai-agents pitch points at "the Reeve merge
  campaign", and the MindFortress timeline line names the team's AI-assisted delivery system
  instead of "multi-agent architecture". Every new text comes from `cv-base.md` or `profile.md`;
  all of it, in both languages, was approved by Jesus on 2026-10-26.

**Verified on 2026-10-26, on the production build:**
- Tests: 430 pass, the freshness check included, against `b1b133b`.
- Build checks: links, previews and structured data valid on 15 pages.
- Both PDFs are two pages, checked visually page by page. The Spanish one leaves about an eighth of
  page 2 free, the English one about a third. The MindFortress heading is identical to
  `cv-base.md`'s in both.
- No HTML, JSON or XML file in `dist/` contains any of the removed claims (searched in English and
  Spanish); the only `$0` left is Intercorp's "~$0.09 per plan".
- Privacy: no phone pattern in `dist/`; the only email is the public contact address, as before.
- Overflow: none on `/`, `/es/` and cases 02 and 03 in both languages at the 12 widths. The sweep
  ran in iframes, whose scrollbar made the 320 px run measure 305 px and flag `/es/` by 7 px; at
  a real 320 px viewport `/es/` and `/es/work/03-merge-campaign/` have no overflow.
- Lighthouse was not run locally; it runs in CI on the pull request.
