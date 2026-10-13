# 019 — One CV, wherever it comes from

Story: [019](../stories/019-one-cv-wherever-it-comes-from.md). Analysis:
[Phase 1.8](../analysis/phase-1-8-canonical-cv.md). Mockup: the CV rendering described in
[../design.md](../design.md) (no Penpot frame; the CV's design lives in `cv.astro`).

**Status:** written on 2026-10-13; the story, the mockup, decisions 1–6 and the publication of
every `cv-base.md` bullet as it is were approved that day.

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
