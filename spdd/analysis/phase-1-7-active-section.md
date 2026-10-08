# Analysis — Phase 1.7: Know where I am

Step 3 of the SPDD flow for story [014](../stories/014-know-where-i-am.md), approved on
2026-10-08. Inputs: the story's measurements, the frames `Home — Desktop 1440 · active section`,
`Home — Tablet 834 · active section` and `Home — Phone 390 · menu active section` (approved
2026-10-08, see [../design.md](../design.md)), `Nav.astro`, `global.css`, the section
components, `CommandPalette.astro` and the story 011 analysis, whose decision 5 left the
highlight out until a story asked for it.

## 1. Diagnosis

| Piece | Today | What the mark needs |
| ----- | ----- | ------------------- |
| Bar links in `Nav.astro` | Three links, `/#work`, `/#open-source`, `/#experience` (with the locale prefix), rendered twice: the desktop row and the phone menu sheet. `text-muted` with `transition-colors` on desktop; `text-primary` with `hover:bg-raised` in the menu | A current state on both copies of the link to the section being read |
| Sections | `<section id>` on `work`, `open-source`, `experience`, `how-i-work`, `contact`; the hero and the proof strip have no id. Only the first three are linked | A rule that marks none of the links while the reader is in the other four blocks |
| The bar | Sticky, 64 px below `md`, 86 px from `md`; `<html>` has a scroll padding of the same height, and sections `scroll-mt-4` | The point that decides "being read" has to sit just under the bar, wherever its height is |
| Jumps | Instant: nothing in the site sets `scroll-behavior: smooth`; the palette only navigates to case pages and the home | No sections fly past during a jump, so no flicker to suppress |
| Other pages | Case pages, the privacy note and the 404 reuse the bar; their links point to the home's sections | No section of the link is on the page, so nothing is marked |
| Scripts | `Nav.astro` has one inline module script, for the phone menu | A small script; without it the bar is exactly today's |

## 2. Direction

### Decision 1 — Which section is "being read"

- **The section that crosses a reading line one pixel under the bar.** After a jump the browser
  places the section's top at the scroll padding, which is the bar's height, so the line falls
  just inside the section that was jumped to: the jumped-to link is marked at once.
- While scrolling, a section becomes current as its top passes under the bar and stops being
  current as its bottom does. In the tablet frame, Open source is still marked although
  Experience is already visible lower down: the reader is still reading the part under the bar.
- If the line is in a block the bar does not link (hero, proof, How I work, Contact, footer),
  no link is marked.
- The alternative, "the section that fills most of the screen", changes its answer with the
  screen height and disagrees with the jump: right after jumping to a short section, a longer
  one below can fill more of the screen.

### Decision 2 — How it is computed

| Option | Verdict |
| ------ | ------- |
| **A. A passive scroll listener, throttled to one `requestAnimationFrame`, that reads the bar's height and the three linked sections' boxes** | **Recommended.** It reads the bar's real height, so it needs nothing to keep in sync across breakpoints, and it also runs on load, on `resize` and on `hashchange`. Three `getBoundingClientRect` calls per frame cost nothing measurable |
| B. `IntersectionObserver` with a one-pixel root margin under the bar | The margin is fixed when the observer is created; it must be rebuilt on every breakpoint change, and a scroll that jumps past a section can skip its callbacks |
| C. CSS only: `scroll-target-group` with `:target-current` | Chromium-only today; Firefox and Safari would show nothing. It could replace the script later |

The decision itself is a pure function, `currentSection(line, sections)`, in `src/lib/`, so it
is unit-tested without a browser; the script in `Nav.astro` only measures and applies it.

### Decision 3 — Which links take part

- A link takes part only if it points to this page (`link.pathname === location.pathname`)
  and its fragment names an element on the page. On case pages, the privacy note, the 404 and
  the CV page no link qualifies, so the script stops without listening to scroll.
- Both copies of the link, in the desktop row and in the phone menu, are marked together.

### Decision 4 — How the mark looks and is announced

- **`aria-current="location"`** on the current link, removed from the others. It is the value
  WAI-ARIA defines for "the current location within a context", and screen readers announce it.
- **Desktop and tablet row:** the text turns from `muted` to `primary`, and a 2 px `signal`
  line, as wide as the word, sits 6 px under it, drawn by an absolutely positioned `::after`
  so it takes no space and shifts nothing. The styles key off `aria-current`, so the state and
  its look cannot drift apart.
- **Phone menu:** the row takes the `raised` background, as on hover, and the same line under
  the word.
- **Contrast:** `primary` is 18.1:1 on `canvas` and 16.1:1 on `raised`. The line is a shape
  cue in `signal`, 15.8:1 on `canvas` and 14.0:1 on `raised`, far above the 3:1 non-text
  minimum.
- **Motion:** the colour change uses `motion-safe:transition-colors`, so with reduced motion the
  mark switches instantly. The desktop links today have `transition-colors` without the
  `motion-safe:` guard; they get it with this change.

### Decision 5 — What stays out and how it is checked

- No scroll position in the URL, no smooth scrolling, no change to section ids, no new copy.
- The unit test covers the pure function: each block, the boundaries between sections, and
  none above the first and below the last linked section.
- The end-to-end check is a scripted Playwright run against the production preview, as for
  story 011, recorded in the canvas Sync: both languages at 390 and 1440 px (the menu open at
  390), the marked link for every block, none on the hero, How I work and Contact, after a jump
  from each link and from a `#fragment` URL; no link marked on a case page; and the bar
  unchanged with scripts disabled.

## 3. Risks

| Risk | Mitigation |
| -------- | ---------- |
| A rounding pixel at the boundary marks the section above after a jump | The line sits one pixel under the bar; the end-to-end run checks the mark right after every jump at both widths |
| The script runs on every scroll frame | It is passive, throttled to one frame, and measures three boxes; Lighthouse's TBT and INP-related audits run in CI |
| A section is renamed and its link silently stops being marked | Links whose target is missing are skipped, not errors; the end-to-end run asserts every link gets marked |
| The `::after` line breaks the overflow audit | It is as wide as its link; the audit runs at all 12 widths |
| Lighthouse | One small inline script, no request; the budget runs on every page in CI |

## 4. Decisions

**✅ Decision 1 — Which section is being read.** Confirmed 2026-10-08: the section crossing a
line one pixel under the bar; none in the unlinked blocks.

**✅ Decision 2 — How it is computed.** Confirmed 2026-10-08: A, a passive scroll listener
throttled to a frame, with the decision in a pure, unit-tested function.

**✅ Decision 3 — Which links take part.** Confirmed 2026-10-08: only links to this page whose
target exists; both copies marked.

**✅ Decision 4 — The mark.** Confirmed 2026-10-08: `aria-current="location"`; primary text and
a 2 px signal line on the row, raised background and the line in the menu; `motion-safe`
transitions.

**✅ Decision 5 — Scope and checks.** Confirmed 2026-10-08: nothing else changes; unit test plus
a scripted end-to-end run recorded in the Sync.
