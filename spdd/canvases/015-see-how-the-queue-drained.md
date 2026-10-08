# 015 — See how the queue drained

Story: [015](../stories/015-see-how-the-queue-drained.md). Analysis:
[Phase 3, case visuals](../analysis/phase-3-case-visuals.md). Penpot, page Cases:
`Case 03 mechanism — Desktop 1440 · step 1`, `· step 3`, `· static`,
`Case 03 mechanism — Phone 390 · step 2`, `· static`, `· step 2 · es`
(see [../design.md](../design.md)).

**Status:** written on 2026-10-08; the story, the frames, the stage copy, decisions 1–5 and the
four UI strings were approved that day. Waiting for the start.

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
