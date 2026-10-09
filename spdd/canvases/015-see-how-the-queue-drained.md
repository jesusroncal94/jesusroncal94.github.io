# 015 — See how the queue drained

Story: [015](../stories/015-see-how-the-queue-drained.md). Analysis:
[Phase 3, case visuals](../analysis/phase-3-case-visuals.md). Penpot, page Cases:
`Case 03 mechanism — Desktop 1440 · step 1`, `· step 3`, `· static`,
`Case 03 mechanism — Phone 390 · step 2`, `· static`, `· step 2 · es`
(see [../design.md](../design.md)).

**Status:** implemented on 2026-10-09; the story, the frames, the stage copy, decisions 1–5, the
four UI strings and the canvas start were approved on 2026-10-08. Synced below; waiting for
Lighthouse in the pull request's CI.

## R — Requirements

Case 03 shows its mechanism inside Approach, after the first paragraph: four stages, stepped
through with buttons or the keyboard where scripts run and motion is allowed, and shown whole,
with numbered sentences, everywhere else.

**Done when:**
- Screenshots match the six frames.
- Unit tests pass for the step function and the dot-count check.
- The end-to-end run passes, both languages, 390 and 1440 px: next and previous with the mouse;
  the arrow keys with focus inside the figure; the buttons disabled at the ends;
  `aria-current="step"` on one stage; the live region holding "Step n of 4" and the sentence;
  the static version, with all four sentences and no step bar, with scripts disabled and with
  reduced motion.
- Case 03's body is unchanged apart from the diagram; the other cases are byte-identical.
- Overflow is zero at all 12 widths on case 03 in both languages.
- Tests pass; the Lighthouse budget passes in CI, case 03's LCP within the last run's range,
  and CLS unchanged.

## E — Entities

```ts
// src/content.config.ts, cases schema
mechanism?: {
  label: string;                              // the figure's name
  stages: Array<{                             // 2–6
    glyph: 'queue' | 'lanes' | 'gate' | 'done';
    label: string; detail: string; sentence: string;
  }>;
}
// refine: a 'queue' or 'done' glyph needs `before` to state 112 (the grid is 14 × 8)

// src/lib/mechanism.ts
stepAfter(current: number, delta: -1 | 1, total: number): number   // clamped to [0, total - 1]
leadingCount(value: string): number | undefined                    // "112 queued" → 112
GRID = { columns: 14, rows: 8 }
```

```
src/i18n/ui/{en,es}.ts   mechanism.step, mechanism.previous, mechanism.next
```

## A — Approach

Decisions 1–5 of the analysis.

1. **Content in the case, drawing in the component.** The MDX body places
   `<Mechanism {...frontmatter.mechanism} locale={props.locale} />`; the case page passes the
   locale to `<Content />`. The component knows glyphs, not cases.
2. **The static version is the markup.** The interactive layout exists only under
   `@media (scripting: enabled) and (prefers-reduced-motion: no-preference)`, decided before the
   first paint.
3. **The script moves one number.** It keeps the current step, writes `data-step`,
   `aria-current`, the buttons' `disabled` and the live region; CSS does the rest.

## S — Structure

```
package.json, astro.config.mjs         + @astrojs/mdx
src/content.config.ts                  cases: **/*.{md,mdx}, + mechanism, + the 112 refine
src/content/cases/{en,es}/03-merge-campaign.mdx   renamed; frontmatter mechanism; <Mechanism />
src/lib/mechanism.ts                   stepAfter, leadingCount, GRID
tests/mechanism.test.ts
src/components/CaseMechanism.astro     figure, stages, glyphs, step bar, list, live region
src/scripts/mechanism.ts               buttons, arrow keys, state
src/pages/[...locale]/work/[slug].astro   <Content locale={locale} />
src/i18n/ui/{en,es}.ts                 three keys
spdd/reviews/004a-es.md                rows for the Spanish copy
```

## O — Operations

1. **The logic.** `src/lib/mechanism.ts` as in the entities. Tests: next and previous inside the
   range and at both ends; `leadingCount` on "112 queued", "112 en cola", "$15/day" (15) and a
   value with no number (undefined).
2. **MDX and the content.**
   - Add `@astrojs/mdx` to the dependencies and the integrations.
   - The cases collection reads `**/*.{md,mdx}`; the schema gains `mechanism` and the refine.
   - `03-merge-campaign.md` becomes `.mdx` in both languages, with the approved stage copy in
     its frontmatter and `<Mechanism … />` after Approach's first paragraph. Until operation 3
     the tag maps to nothing.
   - Check: the build passes; every case page except case 03 is byte-identical to before; case
     03's body is identical apart from where the tag sits; a `before` other than 112 fails the
     build.
3. **The component.** `CaseMechanism.astro`:
   - `<figure aria-label={label}>`; the stages as a list of cards, each with its glyph
     (`aria-hidden`), number, label and detail; arrows between them; the four sentences as an
     `<ol>`; a step bar with the counter, four dots and two `<button>`s named by
     `mechanism.previous` / `mechanism.next`; a `polite` live region.
   - Glyphs in CSS: `queue` and `done` are one element each with a repeating radial gradient
     (4 px dots every 6 px, 14 × 8) in `before` and `signal`; `lanes` three lane `div`s at 1,
     0.7 and 0.4; `gate` one lane with a 2 px `signal` bar.
   - Static by default: all stages full, the `<ol>` shown, the step bar and the live region
     hidden. Under the media query: the step bar shown, the `<ol>` visually hidden, the
     stages not current with the glyph at 0.35 and text in `muted` / `subtle`, the current one
     with a `signal` border and number.
   - Row from `md` (cards 125 px wide in the 680 px column, as in the frames), column below.
   - The case page passes `locale` to `<Content />`, and the MDX maps `Mechanism` to this
     component.
   - Check: screenshots with scripts off against the static frames, and with step 1 rendered
     against the step 1 frame.
4. **The script.** `src/scripts/mechanism.ts`, imported by the component:
   - Per figure: the current step starts at 0; previous and next call `stepAfter`; ArrowLeft and
     ArrowRight do the same while focus is inside the figure.
   - `apply()` sets `data-step` on the figure, `aria-current="step"` on the current stage only,
     `disabled` on the buttons at the ends, the counter text, and the live region to
     "Step n of 4. <sentence>".
   - It does nothing unless the media query matches.
5. **Check,** on the production build: the Done-when list; the Spanish rows added to
   `spdd/reviews/004a-es.md`.

## N — Norms

All of [norms.md](norms.md). In particular:
- "Truthfulness": every word of the diagram is approved copy from the case; no number the case
  does not state; the dot grid is tied to the case's own figure.
- "Works without JavaScript": the static version is complete.
- "Motion respects prefers-reduced-motion": reduced motion gets the static version; nothing
  animates in either.
- "Hidden means hidden to the keyboard too": the hidden step bar's buttons are `display: none`
  in the static version, not just invisible.
- "Tokens, never literals".

## S — Safeguards

- No image, no request, no runtime dependency; the script only runs on case 03.
- Accessibility stays at 100: a named figure, real buttons, a live region, AA contrast on every
  text.
- English and Spanish behave the same.

## Sync — 2026-10-09 (operations 1–5)

This section is authoritative where it differs from the operations above.

- **Op 1** (`a8971d9`). As written; 5 tests, including that 14 × 8 equals the case's 112.
- **Op 2** (`fc9809f`).
  - `@astrojs/mdx` 8.0.3 (it supports Astro ^7.2.10). The refine is on the cases schema and
    reads `before` through `leadingCount`; with `before: 113 queued` the build fails with
    "A queue or done glyph draws 112 dots; the case's "before" must state 112."
  - **The `<Mechanism />` tag moved to op 3:** MDX fails on a component it cannot resolve, so the
    tag went in with the component.
  - Against the build before: 13 of 15 pages byte-identical; the two case 03 pages differ by one
    newline (MDX writes no line break before the body's closing `</div>`), identical without
    newlines.
  - `tests/lighthouse-urls.test.ts` derived the slugs by stripping `.md`; it now strips `.mdx` too.
- **Op 3** (`9a9c440`).
  - `@custom-variant stepped` in `global.css` carries the media query; the stage states live in
    the component's scoped `<style>`. The highlight keys off `data-current`, rendered on stage 1,
    which only the stepped CSS reads; `aria-current` is set by the script alone, so the static
    version announces no current step.
  - **On desktop the arrows sit in the 28 px gap, out of the flow,** so the four cards share the
    width equally (`flex-1 basis-0`); with the arrows inside the items, the last card was wider.
  - **The Spanish review rows were added here, not in op 5:** `tests/review.test.ts` requires a
    reviewed row for every Spanish string, so `mechanism.step`, `.previous`, `.next` and the 13
    case rows (`03.mechanism.*`) went in with the copy, all approved on 2026-10-08. The test now
    reads nested frontmatter keys and ignores MDX component lines in the body.
  - The component's styles, about 1 KB, are inlined on all eight case pages, since Astro bundles
    CSS per route and the cases share one; no request. The global CSS file changes hash.
- **Op 4** (`aaa0c6f`). As written, plus one rule: when the button that has focus becomes
  disabled at an end, focus moves to the other button instead of falling to the page.

**Verified on 2026-10-09, on the production build:**
- End-to-end, Chromium, Firefox and WebKit, English and Spanish, 390 and 1440 px: **1,026 checks
  pass.** Accessible names; the mouse to the end and back, and a click past the end; Enter to the
  end with focus handed to "previous"; ArrowLeft back with focus handed to "next"; ArrowRight;
  arrow keys outside the figure ignored; at every step one `aria-current`, the counter, the
  sentence, the live region ("Step n of 4. …"), the buttons at the ends and the signal border;
  with no script and with reduced motion, the four sentences shown, no step bar and no
  focusable button, no stage marked.
- Screenshots of the six frames' states match them: desktop steps 1 and 3 and static, phone step
  2, static (reduced motion) and step 2 in Spanish.
- Overflow: zero at all 12 widths on both case 03 pages, stepped and static; from 768 px the four
  cards are equal and inside the panel.
- The other case pages differ from the build before only by the inlined component styles and
  the CSS file's name; the home, CV, privacy and 404 pages only by the CSS file's name.
- Keyboard rule of `norms.md`, both case 03 pages at 390 and 1440 px in the three engines: the
  page never moves when focus enters the bar, and no focused element is entirely hidden.
  **One intermittent failure, outside this story:** in WebKit at 390 px, on the first page of a
  freshly launched browser, Tab reached the hidden contact bar in 2 of 7 runs. It did not happen
  in 18 further WebKit runs nor in Chromium. The likely cause is the contact bar's
  IntersectionObserver reporting late on a cold start, so focus enters the bar before it becomes
  `inert` (canvas 003, incident of 2026-10-08). Reported to Jesus.
- Tests: 314 pass. Build checks: links, previews and structured data valid on 15 pages.
- `npm audit`: the same three advisories as `main` (`http-cache-semantics`, accepted; `sharp`
  and `source-map-js`, new since the last review); MDX adds none. Reported to Jesus.

**Pending:** Lighthouse in the pull request's CI, with case 03's LCP and CLS against the last run.
