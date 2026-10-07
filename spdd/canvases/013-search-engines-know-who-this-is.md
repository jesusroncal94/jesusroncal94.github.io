# 013 — Search engines know who this is

Story: [013](../stories/013-search-engines-know-who-this-is.md). Analysis:
[Phase 1.6](../analysis/phase-1-6-structured-data.md). No frames: nothing visible changes.

**Status:** written on 2026-10-07; the story and decisions 1–5 were approved that day, with the
name "Jesús Roncal" only. Waiting for the start.

## R — Requirements

The home pages declare a profile page about one person; the case pages declare articles by that
person; no other page declares anything. Every value comes from a source the page already shows.

**Done when:**
- The home pages carry `ProfilePage` → `Person` and the case pages `Article` with `author`
  pointing to the same `@id`, in both languages; the CV, privacy and 404 pages carry none.
- Case pages declare `og:type` `article`; every other page keeps `website`.
- Unit tests for the builders pass; the post-build check passes and fails on a missing or broken
  block.
- Lighthouse passes in CI.
- Jesus's Rich Results Test on the published home page and one case reports the items and no
  errors.

## E — Entities

```ts
// src/lib/structured-data.ts
PERSON_ID                                   // `${site}/#person`
personEntity(input: PersonInput): Person    // name, jobTitle, address, url, image, sameAs
profilePage(input: ProfilePageInput): ProfilePage
caseArticle(input: CaseArticleInput): Article
toJsonLd(data: object): string              // JSON with `<` escaped as <

// Base.astro
structuredData?: object
ogType?: 'website' | 'article'              // default 'website'
```

## A — Approach

Decisions 1–5 of the analysis.

1. **Pure builders, page inputs.** The builders take plain values; the pages pass what they
   already compute (title, description, preview path, locale, profile fields, portrait URL), so
   the data cannot drift from what is shown.
2. **One script tag, rendered by `Base`.** The page hands `Base` an object; `Base` serialises it
   safely.
3. **Checked after every build,** like links and previews.

## S — Structure

```
src/lib/structured-data.ts           builders and toJsonLd
tests/structured-data.test.ts        happy path for each builder, and the escaping
src/layouts/Base.astro               + structuredData, ogType
src/pages/[...locale]/index.astro    ProfilePage with Person
src/pages/[...locale]/work/[slug].astro   Article; ogType 'article'
src/lib/structured-data-check.ts     findStructuredDataProblems(files)
scripts/check-structured-data.ts     runs it on dist/ after the build
tests/structured-data-check.test.ts
package.json                         build script gains the check
```

## O — Operations

1. **Builders.** `structured-data.ts` with the entities above. `personEntity` takes `name`,
   `jobTitle`, `city` and `country`, `url`, `image`, `profiles`; `caseArticle` takes `headline`,
   `description`, `image`, `url`, `inLanguage`. `toJsonLd` escapes `<`. Tests: a person, a
   profile page, an article, and a summary containing `</script>` that stays inside the string.
2. **`Base`.** Renders `<script type="application/ld+json" set:html={toJsonLd(structuredData)} />`
   when given, at the end of `<head>`; `og:type` from `ogType`. Check: with neither prop, every
   page's HTML is byte-identical to before.
3. **Pages.**
   - Home: the person from `site.displayName`, `og.role`, the export's `city` (split into
     locality "Milan" and country "IT" through a small checked map, so an unknown city fails the
     build), `localePath(locale)` made absolute, the hero's 840 px WebP portrait made absolute,
     and the export's LinkedIn and GitHub. Wrapped in `profilePage` with the page title and
     language.
   - Case: `caseArticle` from the case title, summary, absolute preview path, page address and
     language; `ogType="article"`.
   - The preview image address in the article is the same one `og:image` uses; if the
     post-build versioning adds `?v=` to `og:image`, the article's address must match it, and
     the check compares them.
4. **The check.** `findStructuredDataProblems` reads every built page: home and case pages need
   exactly one block that parses, with the expected `@type`, the shared `@id`, and non-empty
   required fields; an article's image must equal the page's `og:image`; every other page must
   have none. The build script runs it after the preview check. Test: one good set and one of
   each failure.
5. **Check.** Tests and build; the generated blocks read for every home and case page in both
   languages; Lighthouse in the pull request's CI; after the deploy, Jesus runs the Rich Results
   Test and the result is recorded.

## N — Norms

All of [norms.md](norms.md). In particular:
- "Truthfulness": no value that the page does not already show; no invented dates; the full name
  stays out.
- "Tests cover the happy path", plus the failures the check exists to catch.

## S — Safeguards

- Nothing visible changes, and pages without the new props render byte for byte as before.
- No email, employer or date is published.
- The JSON-LD block is data: it adds no executed script and no request.
