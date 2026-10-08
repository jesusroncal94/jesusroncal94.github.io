# Analysis — Phase 3: Case visuals, case 03

Step 3 of the SPDD flow for story [015](../stories/015-see-how-the-queue-drained.md), approved
on 2026-10-08. Inputs: the story's evidence, the six `Case 03 mechanism` frames and their copy
(approved 2026-10-08, see [../design.md](../design.md)), the case collection
(`src/content.config.ts`, `src/content/cases/*/03-merge-campaign.md`), the case page
(`src/pages/[...locale]/work/[slug].astro`), `BeforeAfter.astro` and decision 2 of the
[Phase 1 analysis](phase-1.md), which deferred these visuals.

## 1. Diagnosis

| Piece | Today | What the diagram needs |
| ----- | ----- | ---------------------- |
| Case body | Markdown in a `glob` collection (`**/*.md`); the page renders it whole with `<Content />`. The Spanish files write their headings as raw `<h2 id>` so the anchors match English | A component placed inside "Approach", after its first paragraph, as in the frames |
| Case data | A zod schema: title, summary, before/after, stack, keywords | The stages and their sentences, in each language, checked like the rest of the case |
| UI strings | `src/i18n/ui/{en,es}.ts` | "Step n of 4", the buttons' accessible names, the figure's name |
| Interaction | The only case script is the count-up, which runs when the panel scrolls into view and respects reduced motion | A step state, buttons, keyboard, an announcement of the current step |
| Static version | — | The full mechanism with numbered sentences, for no script and reduced motion, with no shift when the interactive version takes over |
| Budget | Case pages: median LCP about 1,360 ms, CLS ≤ 0.005, no third-party script | No image, no request, no shift; the diagram sits below the first screen |

## 2. Direction

### Decision 1 — How the diagram gets inside the case body

| Option | Verdict |
| ------ | ------- |
| **A. Case 03 becomes `.mdx`** (`@astrojs/mdx`), and the body places `<Mechanism />` after the first paragraph of Approach | **Recommended.** It is Astro's own way to put a component in content, it costs nothing at runtime (MDX compiles at build time) and other cases can follow by renaming their file. One build-time dependency is added, and the collection's pattern becomes `**/*.{md,mdx}`. The raw `<h2 id>` of the Spanish file is valid MDX |
| B. Keep `.md`, render the body to a string through a wrapper and split it at a marker | No new dependency, but the body becomes an HTML string cut by hand and injected with `set:html`, outside Astro's model |
| C. Place the diagram outside the body, before "Problem" | Simple, but not where the approved frames put it, and far from the text it explains |

### Decision 2 — Where the content lives

- **The stages live in the case's frontmatter**, under `mechanism`, one per stage:
  `glyph` (`queue`, `lanes`, `gate`, `done`), `label`, `detail` and `sentence`. The schema
  requires 2 to 6 stages and every field, so a case cannot ship a half-written diagram. Each
  language has its own file, as the rest of the case does.
- **The UI strings go in the dictionary:** the step counter, the two buttons' accessible
  names, and the figure's name (see the copy table below).
- **The component knows only glyphs, not cases.** `CaseMechanism.astro` takes `stages` and
  draws each glyph from a small set; a second case reuses it by writing its own frontmatter and,
  at most, adding a glyph. That is the story's last item in the definition of done.
- **The 112 dots are not hand-written.** The `queue` and `done` glyphs draw a 14 × 8 grid, and
  their count comes from the case's `before` metric (`112 queued`) through a check that fails
  the build if the number is not 112. The drawing can then never disagree with the text.

### Decision 3 — Static first, interactive on top, chosen by CSS

- **The HTML is the static version:** all stages at full strength and the sentences as an
  ordered list. That is what a visitor without scripts gets, and what a screen reader reads.
- **The interactive layout is switched on in CSS by
  `@media (scripting: enabled) and (prefers-reduced-motion: no-preference)`:** the step bar
  shows, the list is replaced by the current step's sentence, and the stages not current are
  dimmed. The media query is known before the first paint, so the page is laid out once in its
  final form and nothing shifts when the script runs. Supported by every current engine
  (Chromium 120, Firefox 113, Safari 17); an older browser gets the static version.
- **The script only moves the step:** the previous and next buttons, the arrow keys while focus
  is inside the figure, the dots as an indicator. It sets `aria-current="step"` on the current
  stage and updates a `polite` live region with "Step n of 4" and the sentence, so the change is
  announced. The pure part, the next and previous step with its bounds, is a function with a
  unit test.
- Moving between steps changes colours and borders only; no transition is needed, and none is
  added, so there is nothing to reduce. With reduced motion the static version is shown, as the
  story asks.

### Decision 4 — How it is drawn

- **HTML and CSS, no image and no SVG file.** Each stage is a card. The dot grids are one
  element each, drawn with a repeating `radial-gradient` background (14 × 8 dots of 4 px every
  6 px), so 224 dots cost two elements. The lanes are three `div`s, faded 1, 0.7 and 0.4; the
  gate is one lane with a bar.
- The drawing is `aria-hidden`; the figure is named, and its text is the list or the live
  region.
- **Contrast,** as fixed in the frames: inactive stages keep their card and their text in
  `muted` and `subtle`, which meet AA on `surface`, and only the drawing fades to 0.35.
- **Buttons:** real `<button>`s, 40 px circles with the arrow icon and an accessible name;
  previous is disabled on the first step and next on the last.

### Decision 5 — What stays out and how it is checked

- No auto-play, no animation, no change to the other three cases or to the before → after
  panel; no number that the case does not state.
- Checks: unit tests for the step function and the 112 check; the scripted end-to-end run in
  the definition of done (mouse, keyboard, live region, no script, reduced motion, both
  languages, 390 and 1440 px); screenshots against the six frames; the overflow audit;
  Lighthouse in CI, comparing case 03's LCP with the last run.

**Copy still to approve** (UI strings; the stage copy was approved with the frames):

| Key | English | Español |
| --- | ------- | ------- |
| `mechanism.label` | How the queue was cleared | Cómo se vació la cola |
| `mechanism.step` | Step {n} of {total} | Paso {n} de {total} |
| `mechanism.previous` | Previous step | Paso anterior |
| `mechanism.next` | Next step | Paso siguiente |

`mechanism.label` is per case, so it lives in the frontmatter next to the stages; the other
three are UI strings.

## 3. Risks

| Risk | Mitigation |
| ---- | ---------- |
| MDX parses a character of the prose differently from Markdown (`{`, `<`) | Case 03 has neither outside its headings; the build fails on a parse error, and the rendered body is compared with today's |
| The interactive and static layouts differ in height | The choice is made in CSS before the first paint, so there is no shift; CLS is checked in Lighthouse |
| A browser without `scripting` media query support | It falls back to the static version, which is complete |
| The dots drift from the case's number | A build check ties the grid to the `before` metric |
| Lighthouse | No image, no request, about 1 KB of script on one page; the budget runs in CI |

## 4. Decisions

**✅ Decision 1 — How the diagram gets in.** Confirmed 2026-10-08: A, case 03 in MDX with
`<Mechanism />` after Approach's first paragraph.

**✅ Decision 2 — Where the content lives.** Confirmed 2026-10-08: stages in the frontmatter,
UI strings in the dictionary, a component that knows only glyphs, and the dot count checked
against the case.

**✅ Decision 3 — Static first.** Confirmed 2026-10-08: static HTML first; the interactive
layout chosen by a CSS media query; a script that only moves the step and announces it.

**✅ Decision 4 — How it is drawn.** Confirmed 2026-10-08: HTML and CSS drawing, contrast as
in the frames, real buttons.

**✅ Decision 5 — Scope and checks.** Confirmed 2026-10-08: as listed, with the four strings in
the table approved.
