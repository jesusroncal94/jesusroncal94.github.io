# 023 — See how it ships and adapts

**As a** technical interviewer, or Jesus himself months from now, reading this repository
**I want** to see how a change is checked on its way to the site, and how each page adapts to the
reader's theme and language
**So that** I understand the three systems that cause the most subtle failures without reading the
workflow, the theme code and the translation checks line by line

This story continues the documentation started by story 021, which left the CI pipeline and the
theme and language systems for a later story.

## Evidence (2026-10-15)

- **The documentation gives each system one sentence.** `docs/architecture.md` says CI "runs the
  tests and the build, then Lighthouse on every page in the light and the dark theme"; the theme
  and the languages get a bullet each. The entry page says the folder explains the site "in three
  diagrams".
- **The CI pipeline has grown past what a sentence holds.**
  - `site` classifies the change, runs the tests and the build;
  - 14 Lighthouse jobs: 7 shards of the pages, each in light and in dark;
  - a `build` gate, the check `main` requires, which accepts a skipped Lighthouse only when the
    change is documentation only (`src/lib/ci-scope.ts`);
  - `deploy` on `main` only.
  
  The docs-only path was proven on #40 and #42; the canvas of story 021 still says it "should"
  skip.
- **The theme is decided in four places.**
  - The system's preference, read by CSS (`global.css`);
  - the visitor's choice, kept in `localStorage` and applied before the first paint by an inline
    script (`bootTheme`);
  - a page that pins its theme (`data-theme` with `data-theme-pinned`: the CV, the preview cards);
  - every colour is one `light-dark()` token, so one list serves both themes.
  
  Since story 022, analytics records the theme and who decided it. Story 022's first CI run failed
  on LCP because a shared module split the theme scripts into an extra request: the cost of a
  change here is not visible from the code.
- **The language system fails the build rather than publish an unreviewed text.**
  - English and Spanish are published; Italian is built but held out of `PUBLISHED_LOCALES`
    (story 004b, on hold);
  - every Spanish string traces to an approved row in `spdd/reviews/004a-es.md`, and a profile
    value with no translation throws;
  - each page links its other languages (`hreflang`), and the 404 page picks its language in the
    browser from the address.

## Acceptance criteria

- WHEN a reader opens `docs/`
  THEN the entry page lists the three new pages in the reading order, and no longer says three
  diagrams
- WHEN the reader opens the CI, theme or languages page
  THEN a diagram heads it, and numbered steps or parts below say the same in text, so the page
  reads fully without the image
- WHEN the CI page is read
  THEN it shows the jobs in order, which of them run for a documentation-only change, which check
  `main` requires, and what makes each one fail
- WHEN the theme page is read
  THEN it shows who decides the theme, in order of precedence, where each decision is applied, and
  what analytics records about it
- WHEN the languages page is read
  THEN it shows how a text reaches a published language, what fails the build, and why Italian is
  not published
- WHEN the architecture page mentions CI, the theme or the languages
  THEN it links the page that explains it
- WHEN the new diagrams are checked
  THEN the checks of story 021 cover them with no new code: manifest, a page for each diagram, no
  web font or script, token colours only
- WHEN the documentation describes `cv-manager` or analytics
  THEN it shows only the boundary and what crosses it, never personal data or a key

## Definition of done

- The three diagrams (CI pipeline, theme, languages) are designed in the docs Penpot file, in its
  existing visual language, and approved before the pages are written
- The page texts are approved
- The manifest, the entry page and the architecture page are updated, and the `.penpot` backup is
  refreshed
- The canvas of story 021 records that the docs-only path was proven on #40 and #42

**✅ Approved on 2026-10-15:** the story as written. The three diagrams are its mockups, designed in
the docs Penpot file and approved before the pages are written.
