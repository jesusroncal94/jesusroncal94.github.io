# Analysis — Phase 4.1: Know which theme is read

Step 3 of the SPDD flow for story [022](../stories/022-know-which-theme-is-read.md), approved on
2026-10-15 without new frames. Inputs:
- the privacy note's new copy, approved on 2026-10-15;
- `src/lib/track.ts`, `src/scripts/analytics.ts` and `src/scripts/contact.ts`;
- `src/lib/theme.ts`, `src/scripts/theme-switch.ts` and `src/layouts/Base.astro`;
- canvas 009, its Syncs (verification, dashboard, test traffic) and the
  [Phase 4 analysis](phase-4-analytics.md).

## 1. Diagnosis

| Piece | Today | What the story needs |
| ----- | ----- | -------------------- |
| Event properties | `buildEvent` adds `locale` and the `utm_*` tags; `Visit` is read once per event by `readVisit` | The theme the page is shown in, and where it comes from, on every event |
| Theme shown | Decided by CSS: `color-scheme` is `light` or `dark` from `data-theme` or `prefers-color-scheme` | Read back as the page shows it, not re-derived |
| Theme source | Not recorded. `data-theme` is set either by the server, for a page that pins its theme (`/cv/` light), or by `bootTheme`, for a visitor's choice; at run time the two look the same | Choice, system, or pinned by the page, told apart |
| Switch | `theme-switch.ts` applies and stores the choice; no event | A `theme_change` event with the choice |
| Contact clicks | `contact.ts` imports only types from `track.ts` and sends a `conversion` `CustomEvent` that `analytics.ts` turns into `track()`; this keeps the analytics code in one module | The switch can use the same channel |
| Privacy note | "Nothing is stored in your browser"; the theme is not listed | The approved copy |
| Dashboard | Web analytics, "Conversions per week, by language", "CV downloads per day", all excluding `utm_source` `verification` and `lighthouse` | Visits by theme and source, switch uses by choice |

The CV page loads the analytics script (it uses `Base.astro`) and pins `data-theme="light"`.
Without a third source its visits would count as a visitor's choice of light.

## 2. Direction

### Decision 1 — Two properties, read from the page

- **`theme`**: `light` or `dark`, read from `getComputedStyle(document.documentElement).colorScheme`.
  It is what CSS applied, so it cannot disagree with what the visitor saw.
- **`theme_source`**:
  - `page` when the page pins its theme;
  - `choice` when a choice is stored and applied;
  - `system` otherwise.
- **Telling a pinned page apart:** `Base.astro` adds `data-theme-pinned` when it receives a
  `theme`. `bootTheme` already leaves those pages alone.
- **Code:** a pure `themeOf(colorScheme, pinned, storedChoice)` in `src/lib/theme.ts`, unit-tested
  for each case. `readVisit` calls it, so every event carries both properties, and `buildEvent`
  adds them next to `locale`.

### Decision 2 — The switch speaks through the existing channel

- `theme-switch.ts` sends the same `conversion` `CustomEvent` that `contact.ts` sends, with
  `{ event: 'theme_change', props: { choice } }`. `analytics.ts` already forwards it to `track()`.
- The switch stays free of the analytics code, as the contact links are, and no new listener or
  module is added.
- `theme_change` joins `AnalyticsEvent` but not `ConversionEvent`, so the type keeps the five
  conversions apart. The detail type is widened to accept it.
- The insight "Conversions per week, by language" lists its five events by name, so the new event
  does not enter it.
- A choice of the option already selected sends nothing, since the radio does not change.

### Decision 3 — The privacy note

- The approved copy replaces the two sections in English and Spanish.
- `updated` takes the date of the merge.
- No test holds the note's text today (searched 2026-10-15). The check is the built page in both
  languages against the approved copy.

### Decision 4 — The dashboard

Two insights on the project's main dashboard, both excluding `utm_source` `verification` and
`lighthouse`, like the existing ones:
- **"Visits per week, by theme"**: `$pageview`, weekly, broken down by `theme` and `theme_source`.
- **"Theme switch per week, by choice"**: `theme_change`, weekly, broken down by `choice`.

They are created through the PostHog connector, as in Phase 4. It answered on 2026-10-15 from
the project `292086`, whose app URL is `https://jesusroncal94.github.io`.

### Decision 5 — Verification on the published site

- From the browser pane, which carries no owner mark, with `?utm_source=verification`:
  - a page view with the system light and one with it dark;
  - the switch to Light, Dark and Match system;
  - `/cv/` once.
- Checked through the connector:
  - the page views carry `theme` and `theme_source` (`system` light, `system` dark, `choice`,
    `page`);
  - one `theme_change` arrives for each choice.
- The local checks: the unit tests, and the end-to-end check that a fresh profile ends with no
  cookie and no storage key after visiting every page.

## 3. Risks

- **`colorScheme` before the stylesheet applies.** `$pageview` is sent on `load`, after the CSS,
  so it is set. A value other than `light` or `dark` is reported as `dark`, the site's default,
  and the unit test covers it.
- **Bundle size.** The change adds a few lines to two scripts already on every page. The 15 KB
  budget is checked by Lighthouse in CI, in both themes.
- **Reading the data.** The numbers will be small for weeks. A week with few visits is not a
  trend, and the canvas says so where the first numbers are written.

## 4. Decisions

**✅ Decision 1 — Two properties, read from the page.** Confirmed 2026-10-15: `theme` from the
computed `color-scheme`; `theme_source` `choice`, `system` or `page`, with `data-theme-pinned` on
pages that pin their theme.

**✅ Decision 2 — The switch speaks through the existing channel.** Confirmed 2026-10-15:
`theme_change` with `{ choice }`, through the `conversion` `CustomEvent`, outside
`ConversionEvent`.

**✅ Decision 3 — The privacy note.** Confirmed 2026-10-15: the approved copy, `updated` set to
the merge date, checked on the built page in both languages.

**✅ Decision 4 — The dashboard.** Confirmed 2026-10-15: two insights on the main dashboard,
created through the connector, excluding test traffic.

**✅ Decision 5 — Verification on the published site.** Confirmed 2026-10-15: a tagged visit from
the browser pane in both system themes, the three choices and `/cv/`, checked through the
connector.
