# Analysis — Phase 1.4: Navigation always within reach

Step 3 of the SPDD flow for story [011](../stories/011-navigation-always-within-reach.md),
approved on 2026-10-05. Inputs: the story's measurements, the frames
`Home — Desktop 1440 · scrolled`, `Home — Tablet 834 · scrolled`, `Home — Phone 390 · scrolled`
and `Home — Phone 390 · menu scrolled` (approved 2026-10-05 with a solid background, see
[../design.md](../design.md)), `Nav.astro`, `LocaleSuggestion.astro`, `ContactBar.astro`,
`Base.astro` and the section components.

## 1. Diagnosis

| Piece | Today | What a pinned bar changes |
| ----- | ----- | ------------------------- |
| `<header>` in `Nav.astro` | `relative z-20`, a direct child of `<body>` on home, case and privacy pages; no ancestor sets `overflow` | It can stick with CSS alone; nothing needs to move |
| Header height | 64 px below `md`, 86 px from `md` | Every jump target must clear this height, which differs by breakpoint |
| Section anchors | `scroll-mt-4` (16 px) on `#work`, `#open-source`, `#experience`, `#how-i-work`, `#contact`; case headings get ids from Markdown (`#problem`, `#approach`, `#result`) and have no margin | A jump would put the heading under the bar |
| Focus | The browser scrolls a focused element just into view | A focused element near the top could end up under the bar (WCAG 2.2, 2.4.11) |
| Phone menu sheet | `absolute top-16 z-40`, inside the header | It opens from the pinned bar; no change needed |
| Language suggestion | Phone: a pill inside the nav row. Desktop: a card `absolute top-full` under the switcher, inside the header | Both would stay on screen while scrolling, until dismissed |
| Phone contact bar | `fixed bottom-4 z-30` | Unchanged; it and the bar never overlap. It can already hide a focused element at the bottom of the screen |
| Hero glow | Inside the hero section (`isolate`, `overflow-x-clip`), below the bar | Unaffected by a solid bar |
| Scripts | None involved | None needed |

## 2. Direction

### Decision 1 — How the bar stays

| Option | Verdict |
| ------ | ------- |
| **A. `position: sticky; top: 0`** on the header | **Recommended.** The bar keeps its place in the flow, so nothing shifts at load or on scroll, it works without JavaScript, and the menu sheet and the suggestion keep positioning against it |
| B. `position: fixed` plus a spacer of the header's height | Two heights to keep in sync across breakpoints, and any mismatch is a layout shift |
| C. Hidden on scroll down, shown on scroll up | Needs a script and motion; the story keeps the bar always visible |

### Decision 2 — The background and the border

- **The background is solid** `bg-canvas`, as approved with the frames.
- **The border line appears only once the page has scrolled**, so the top of every page looks
  exactly as it does today, and the scrolled state matches the new frames.
- It uses a CSS scroll-driven animation (`animation-timeline: scroll()`), inside
  `@supports`: the border colour switches from transparent to `border` within the first few
  pixels of scroll. There is no script.
- In a browser without scroll-driven animations (Firefox today), the bar is the same solid bar
  without the line. The content still passes under an opaque edge, so reading is unaffected.
- It is a colour change, not motion, and it completes in a few pixels of scroll, so it needs
  no `prefers-reduced-motion` variant.
- The alternative, a border that is always there, adds a line under the nav at the top of every
  page, a change to the approved Phase 1 frames that the story does not ask for.

### Decision 3 — Jumps and focus clear the bar

- `scroll-padding-top` on `<html>` equals the bar's height: 64 px, and 86 px from `md`. The
  sections keep `scroll-mt-4`, so a section heading lands 16 px below the bar, as it lands
  16 px below the top today.
- Scroll padding is meant to apply whenever the browser brings a fragment target or a focused
  element into view, so the same rule should cover jumps from the bar, the palette, "Next
  case", a URL with a `#fragment`, and keyboard focus. That browsers honour it for focus is
  checked, not assumed: the end-to-end run tabs through a page and measures every focused
  element against the bar.
- Case headings (`#problem`, `#approach`, `#result`) have no margin; the padding alone puts
  them right under the bar. They get the same 16 px through one rule on the article's `h2`.
- **Below `md`, `scroll-padding-bottom`** equals the contact bar's footprint (about 84 px), so
  a focused element is not hidden behind that bar either. This fixes the same problem at the
  other edge, which the story's focus criterion covers in spirit.

### Decision 4 — The language suggestion

- **Phone pill:** it stays inside the pinned bar until it is dismissed or followed. It sits in
  the bar's own row, so it covers nothing.
- **Desktop card:** it moves out of the header, so it scrolls away with the top of the page as
  it does today. Pinned, the 340 px card would cover the right side of the reading column on
  every screen until dismissed. It keeps its position under the switcher at the top of the
  page.

### Decision 5 — What stays out

- No hide-on-scroll behaviour, no shadow, no blur, no change of height when scrolled.
- No highlight of the current section in the bar. It would need a script and is not in the
  story.
- The CV page and the preview cards have no navigation and do not change.

## 3. Risks

| Risk | Mitigation |
| ---- | ---------- |
| A future `overflow` on an ancestor silently stops the bar from sticking | The end-to-end check scrolls each page and asserts the bar's top stays at 0 |
| The scroll padding drifts from the real bar height after a design change | The end-to-end check jumps to every home section and to `#result`, and measures the heading below the bar at 390, 834 and 1440 px |
| Scroll-driven animations behave differently across browsers | The border is the only thing that depends on them; without them the bar is unchanged and readable |
| The desktop card, moved out of the header, loses its position under the switcher | Screenshots at 1440 px compare it with the `· i18n` frame |
| Lighthouse | Sticky positioning adds no request, script or layout shift; the budget runs in CI |

## 4. Decisions

**⚠️ Pending — 1, how the bar stays.** Recommended: A, `position: sticky; top: 0`.

**⚠️ Pending — 2, background and border.** Recommended: solid `bg-canvas`, with the border line
shown only once scrolled, through a scroll-driven animation inside `@supports`, and no line
where it is unsupported.

**⚠️ Pending — 3, jumps and focus.** Recommended: `scroll-padding-top` equal to the bar's height
per breakpoint, 16 px more for case headings, and `scroll-padding-bottom` for the phone contact
bar.

**⚠️ Pending — 4, the language suggestion.** Recommended: the phone pill stays in the pinned bar;
the desktop card moves out of the header and scrolls away as today.

**⚠️ Pending — 5, what stays out.** Recommended: no hide-on-scroll, no section highlight, no
change to the CV page.
