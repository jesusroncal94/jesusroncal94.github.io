# 002 — Case study deep dive

Story: [002](../stories/002-case-study-deep-dive.md). Figma: Desktop Selected work `5:117`,
Open source `6:158`, Experience `6:213`, How I work `6:269`; Mobile Selected work `8:71`,
Experience `9:132`, How I work `9:156`. Components: `CaseCard 2:121`, `StackTag 2:96`,
`AskPrompt 2:112` (rebuilt as the command palette).

**Status:** implemented and synced on 2026-09-23 (see the Sync section). Case texts approved on 2026-09-24. The `rag-bm25-search` note (operation 14) approved on 2026-10-05, in English and Spanish.

## R — Requirements

A hiring manager can judge engineering judgement from real problems.

- Four case cards on the home page, each linking to its own page.
- Each case page reads Problem → Approach → Result, states the role, and ends with the stack.
- A before → after panel whose numbers count up when it scrolls into view. The bespoke
  interactive visuals are Phase 3 (analysis decision 2).
- The end of every case page offers the next case and the contact actions together.
- The depth layer on the home page: Open source, Experience timeline, How I work.
- The hero prompt is a ⌘K command palette that jumps to sections, cases, repos and the
  three suggested questions (analysis decision 1).

**Done when:** four case pages exist and each reads in about ninety seconds; the palette opens
with ⌘K / Ctrl+K and from the hero, and filters by keyboard alone; the home depth sections
match Figma.

## E — Entities

```ts
Case {                         // content collection `cases`, one Markdown file per locale
  slug: string                 // "01-evals"
  order: number
  organisation: string         // "Intercorp"
  product?: string             // "Reeve", "Freya"
  role: string                 // "AI Engineer"
  period: string               // "2024 — now"
  title: string
  summary: string              // the card body
  before: string               // "45.6%"
  after: string                // "100%"
  stack: string[]
  body: Markdown               // ## Problem, ## Approach, ## Result
}

Repo { name: string; url: URL; title: string; pitch: string; note: string; stack: string[] }
Principle { numeral: string; title: string; body: string }
TimelineLine { roleId: string; line: string }       // joins Role from the export
PaletteEntry { id: string; group: 'section'|'case'|'repo'|'question'|'action'; label: string; keywords: string[]; href: string }
```

## A — Approach

Cases are an Astro content collection per locale, rendered by `work/[slug].astro` with
`getStaticPaths`. The count-up splits a value into prefix, number and suffix (`$15/day` →
`$`, `15`, `/day`), so any metric animates without special cases. It runs through `motion`'s
`animate` and `inView`, and renders the final value in the HTML so it reads correctly
without JavaScript.

The palette is a native `<dialog>` with a listbox, built from `PaletteEntry[]` at build time
and serialised into the page, so there is no fetch. Ranking is a pure function. The hero shows
a button styled as the approved prompt; the dialog provides the focus trap and Escape for
free.

The home depth sections read their copy from `site/en.yaml`. The Experience timeline joins
`public-profile.json` roles (title, organisation, dates) with the editorial one-liners by
`roleId`.

## S — Structure

```
src/content/cases/en/01-evals.md
src/content/cases/en/02-cost-leak.md
src/content/cases/en/03-merge-campaign.md
src/content/cases/en/04-freya.md
src/content/site/en.yaml            + repos, principles, timelineLines, suggestedQuestions
src/components/StackTag.astro
src/components/CaseCard.astro
src/components/BeforeAfter.astro
src/components/CommandPalette.astro
src/lib/count-up.ts                 splitNumeric(), countUp()
src/lib/palette.ts                  buildEntries(), rankEntries()
src/lib/timeline.ts                 buildTimeline()
src/sections/Work.astro
src/sections/OpenSource.astro
src/sections/Experience.astro
src/sections/Principles.astro
src/pages/work/[slug].astro
tests/count-up.test.ts
tests/palette.test.ts
```

## O — Operations

1. **Collection `cases`** in `content.config.ts` using the glob loader over
   `src/content/cases/**/*.md`, with the `Case` schema; the locale comes from the folder.
2. **Four case files.** Write the long-form copy from `profile.md` facts, using only the
   approved softened wording (see analysis §4 and the mockup cards). Each body has
   `## Problem`, `## Approach` and `## Result`, 250–350 words in total. **Jesus reviews and
   approves the four texts before this operation is marked done.**
3. **`StackTag.astro`** (`2:96`) and **`CaseCard.astro`** (`2:121`): eyebrow
   `"{order} · {product ?? organisation} · {role}"`, title, `BeforeAfter` in compact mode,
   summary, stack tags, and "Read the case →". The whole card is one link, with the title as
   its accessible name.
4. **`src/lib/count-up.ts`**:
   `splitNumeric(value: string): { prefix: string; number: number; decimals: number; suffix: string } | null`
   and `countUp(element: HTMLElement, value: string, locale: Locale): void`. The latter
   animates from 0 over 900 ms with ease-out, and only when reduced motion is not requested.
   Test: `tests/count-up.test.ts` covers `45.6%`, `$15/day`, `112 queued` and
   `7 agents`.
5. **`BeforeAfter.astro`**: `before` in `status-before`, an arrow icon, `after` in
   `signal`; `metric-l` (48 px) from `md` up, 34 px below. Values carry `data-count-up`; one
   module script calls `countUp` for each when it enters the viewport.
6. **`Work.astro`**: section `id="work"`, eyebrow and heading from `site`, 2 × 2 grid from
   `md` up (gap 24) and stacked below. Mobile shows the first two cards and a ghost link
   "Two more cases" to `#work-more`, which reveals the rest (`<details>`).
7. **`pages/work/[slug].astro`**: `Base` layout with a per-case title and description.
   Header (eyebrow, `<h1>` title, role · period); the full-size `BeforeAfter`; the rendered
   Markdown in a 680 px measure with `body-l` paragraphs and `heading-h3` subheads; the stack
   tags; then an end block with "Next case →" (wrapping from 04 to 01) next to the primary
   "Download CV" and secondary "Email me".
8. **`OpenSource.astro`** (`6:158`): three equal-height cards from `site.repos`, with the
   repo name in `code-mono` glow colour, the title, the pitch, the honest-note strip and the
   stack tags. The whole card links to GitHub (`target="_blank"`, `rel="noopener"`).
9. **`src/lib/timeline.ts`**: `buildTimeline(roles: Role[], lines: TimelineLine[], locale)`
   returns the approved rows in the Figma order, with the period formatted through
   `formatPeriod`. **`Experience.astro`** (`6:213` / `9:132`) renders four columns from
   `md` up and stacks them below, marking the current role's period in `signal`.
10. **`Principles.astro`** (`6:269` / `9:156`): three columns with a serif numeral in glow,
    the title and the body; stacked rows on mobile.
11. **`src/lib/palette.ts`**: `buildEntries(site, cases, locale): PaletteEntry[]` and
    `rankEntries(query, entries): PaletteEntry[]` (case- and accent-insensitive token match
    over label and keywords; label matches rank above keyword matches; an empty query
    returns all, grouped). Test: `tests/palette.test.ts` checks that "cost" ranks
    `02-cost-leak` first.
12. **`CommandPalette.astro`**: the trigger is a `<button>` styled as `AskPrompt 2:112`,
    with sparkles, the placeholder "Jump to a case, a repo or a question…", `⌘K` and the send
    disc. The three suggested questions below are plain links to their cases, so they work
    without JavaScript. The `<dialog>` holds an input with `role="combobox"` and a
    `role="listbox"` of results. ↑/↓ move the active option, Enter follows its `href`, Esc
    closes. A global listener opens it on ⌘K / Ctrl+K. The hint line under the prompt reads
    "Press ⌘K anywhere to jump around."
13. **Home assembly**: `index.astro` adds Work, OpenSource, Experience and Principles after
    Proof, and the palette inside Hero. The Figma "Ask the portfolio" section `5:44` is
    **not** rendered in Phase 1 (story 005).

### Follow-up — the `rag-bm25-search` note (started 2026-10-05)

The repository merged a query rewrite (`jesusroncal94/rag-bm25-search#1`, `4f3ea8d`, merged
2026-10-05). Its README now reports, measured with `qwen/qwen3.8-27b` on the holdout split
for both the code before and after the change: natural phrasing answered 1 of 6 → 5 of 6,
retrieval 6 of 6, every unanswerable question declined. The card's honest-note strip still
said "answering 1/6".

14. **The note.** `openSource.repos[0].note` becomes "Retrieval 6/6 · answering 1/6 → 5/6 —
    measured, not claimed" and, in Spanish, "Recuperación 6/6 · respuesta 1/6 → 5/6: medido,
    no supuesto", both approved by Jesus on 2026-10-05. The review row in
    `spdd/reviews/004a-es.md` follows, so the review test still matches. Nothing else on the
    card changes. Check: tests and the build checks; the card at 320, 360, 390 and 430 px in
    both locales without overflow; Lighthouse in the pull request's CI.

### Follow-up — the arrows and reduced motion (started 2026-10-06)

Found while fixing the contact bar (canvas 003, operation 13): the arrow of a case card on the
home page and the arrow of "Next case" on a case page shift 4 px on hover
(`transition-transform group-hover:translate-x-1`) whatever the motion preference. Jesus approved
including them on 2026-10-06.

15. **The nudge becomes `motion-safe:`.** Both arrows get
    `motion-safe:transition-transform motion-safe:group-hover:translate-x-1`. With reduced
    motion they stay still on hover; the card's border and the link's colour still change.
    Check: with reduced motion, hovering a case card and "Next case" leaves the arrow's
    transform at none; without it, the arrow moves 4 px as before.

## N — Norms

All of [norms.md](norms.md). Case copy follows Problem → Approach → Result with no
superlatives that the numbers do not carry.

## S — Safeguards

- Case copy uses no infrastructure detail beyond the approved wording. In particular, the
  cost-leak case describes its cause only as a stale background worker.
- Intercorp copy uses only the metrics approved for publication.
- The palette never pretends to answer: every entry is a link to existing content.

## Sync — 2026-09-23

Implemented. The code differs from the operations above in these places; this section is
authoritative where they disagree.

- **E, op 1.** A case has no `slug` or `period` field. The slug comes from the file name
  (`cases/en/01-evals.md` → `01-evals`), and the period is computed from `roleId` against
  `public-profile.json`, so dates live in one place. `keywords` feeds the palette.
- **E, op 9.** Timeline entries carry the approved display copy (`role`, `organisation`,
  `place`, `line`) and only take their dates from the export. Entries marked `earlier`
  collapse on mobile into one row (`earlierSummary`, period 2017 — 2022), matching the
  mobile frame.
- **Op 4.** `countUp` is a 20-line `requestAnimationFrame` loop with ease-out cubic and an
  `IntersectionObserver` at 60% visibility, not the `motion` library. Motion would have cost
  most of the 15 KB script budget for one number animation, so the dependency was removed.
- **Op 5.** `BeforeAfter` exposes one sentence to screen readers ("Before: 45.6%. After:
  100%.") and hides the animated digits from them.
- **Op 6.** "Two more cases" on mobile reveals the rest with `:target`, not `<details>`, so
  the same markup can sit in the two-column grid on desktop (`md:contents`).
- **Ops 11–12.** The palette's entries are built by `src/lib/palette-entries.ts` and served
  as a static `/palette.json`, fetched when the pointer or focus reaches the trigger, or when
  ⌘K is pressed. Options are rendered from a `<template>`. Keeping 21 options and their JSON
  out of the HTML is what keeps the home page within its byte budget. The trigger is a link to
  `#work`, so it still does something without JavaScript, and it is hidden below `md`, as in
  the mobile frame.
- **Mobile copy.** Mobile shows the full case summaries, eyebrows and principle bodies
  rather than the shortened variants drawn in the mobile frame, to keep one approved text per
  item. The open-source section, absent from the mobile frame, is shown on mobile too.
- **Case page.** The end block stacks "Next case" above the two CTAs; side by side they did
  not fit the 680 px measure.

### Performance work this canvas triggered

Adding four sections pushed the home page's mobile LCP to 1.52 s, over the 1.5 s budget, and
made it bimodal (1.37 s or 1.52 s depending on the run). Measured, one change at a time:

| Change | Home LCP (mobile, median) | Kept |
| ------ | ------------------------- | ---- |
| Baseline after the new sections | 1.52 s | — |
| Palette data moved to `/palette.json` | 1.52 s | yes, for bytes |
| Content-visibility on below-fold sections | 1.52 s | no, no measurable effect |
| Stylesheet served as a file again (HTML 8.9 KB gz) | 1.37–1.52 s, bimodal | yes |
| Fonts subset to the weights and glyphs in use (74 → 50 KB) | **1.38 s, stable** | yes |

The bimodality came from Geist Mono: whether its request started before the LCP paint
decided whether Lighthouse charged its download to the LCP. Smaller fonts removed the swing.

**Verified:** all five pages score 100 in performance, accessibility, best practices and
SEO; the budget's assertions pass on 5 URLs × 3 runs; home LCP 1.38 s, case pages 1.07–1.23 s;
CLS ≤ 0.005; total inline JavaScript under 3 KB compressed on the home page.

### Approval

Operation 2 is done: Jesus approved the four case texts on 2026-09-24, after five claims were
corrected to what `profile.md` states. The unit-generation guardrails are attributed to that
engine, not to the eval pipeline; Railway is gone from the cost-leak stack; the Freya agents
work "alongside" the consistency engine rather than "over" it; the stale worker keeps no
infrastructure detail; the three countries stay.

**Copy amendment, 2026-09-30.** MindFortress ended in 2026-09, so case 03's closing line moved
to the past tense: "the same division of labour I used for release gating day to day at
MindFortress". Jesus approved it on 2026-09-30.

## Sync — 2026-10-05 (operation 14, the `rag-bm25-search` note)

- **Changed** (`16574fe`): the note in `site/en.yaml` and `site/es.yaml`, and its row in
  `spdd/reviews/004a-es.md`, marked approved on 2026-10-05. Title, pitch and stack are
  unchanged.
- **Source of the figures:** the merged README of `rag-bm25-search` (`4f3ea8d`), where both
  sides of 1/6 → 5/6 are measured with the same model on the same holdout split. Its caveats,
  one extra model call per question and one run per side, stay in that README, which the card
  links to.

**Verified on 2026-10-05, on the production build:**
- Tests: 273 pass, the review test included. Build checks: "none broken" on 14 pages, and every
  preview complete.
- The note wraps inside the card at every width checked, 320, 360, 390, 430, 768, 1280 and
  1440 px, in both locales, with zero page overflow: three lines at 320 px, two at 1440 px,
  as a block like the previous note.
- Lighthouse: confirmed by the pull request's CI.

## Sync — 2026-10-06 (operation 15, reduced motion)

- **Changed** (`e16fd6a`): the case-card arrow (`CaseCard.astro`) and the "Next case" arrow
  (case page) nudge only under `motion-safe:`.
- **Verified on the production build** at 1440 px, hovering the first case card on `/` and
  "Next case" on `/work/02-cost-leak/`:
  - with `prefers-reduced-motion: reduce`, the arrow's `translate` stays `none`;
  - with `no-preference`, it moves `4px` over 0.15 s, as before.
- After this and canvas 003's operation 13, every movement on the site is gated: the proof
  rise and the contact bar with `motion-safe:`, the count-up in its script, the arrows here.
  Colour-only hover transitions are not motion and are left as they are.
