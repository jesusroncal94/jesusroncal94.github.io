# 022 — Know which theme is read

Story: [022](../stories/022-know-which-theme-is-read.md). Analysis:
[Phase 4.1](../analysis/phase-4-1-theme-analytics.md). Penpot: no new frames; the privacy note's
frame exists since story 009.

**Status:** canvas written on 2026-10-15. The story, the privacy note's new copy in English and
Spanish, and decisions 1–5 were approved that day.

## R — Requirements

Every event carries the theme the page is shown in and its source, and the theme switch records
a `theme_change` event, with no new request, storage key or behaviour. The privacy note says so,
and two insights show the numbers.

**Done when:**
- `themeOf` returns the right theme and source for system light, system dark, chosen light,
  chosen dark and a pinned page, and falls back to `dark` on an unknown `color-scheme`.
- The `$pageview` payload carries `theme` and `theme_source`; `theme_change` carries `choice`.
- The switch behaves as before, and sends one event per change.
- The privacy note shows the approved copy, in both languages, with the new date.
- In CI: the tests, and Lighthouse in both themes.
- On the published site, a tagged visit's events arrive with the expected properties, and one
  `theme_change` per choice.
- The two insights exist on the main dashboard, and their IDs are in the Sync.

## E — Entities

```
Visit                  + theme: 'light' | 'dark', themeSource: 'choice' | 'system' | 'page'
themeOf(colorScheme: string, pinned: boolean, stored: ThemeChoice)
                       → { theme, themeSource }                         src/lib/theme.ts
AnalyticsEvent         + 'theme_change'   (not a ConversionEvent)
Conversion             detail of the 'conversion' CustomEvent, widened to TrackedAction:
                       { event: ConversionEvent | 'theme_change', props? }
event properties       + theme, theme_source; theme_change: + choice
<html>                 + data-theme-pinned on pages that pass `theme` to Base
```

## A — Approach

Decisions 1–5 of the analysis.

## S — Structure

```
src/lib/theme.ts                  + themeOf
src/lib/track.ts                  Visit, readVisit, buildEvent, AnalyticsEvent, TrackedAction
src/scripts/theme-switch.ts       dispatches theme_change
src/layouts/Base.astro            data-theme-pinned
src/content/site/{en,es}.yaml     privacy: two sections and `updated`
tests/theme.test.ts, tests/track.test.ts
```

## O — Operations

1. **The properties.**
   - `themeOf` with tests for the five cases and the fallback.
   - `Base.astro` marks pinned pages.
   - `Visit` and `readVisit` read the computed `color-scheme`, the mark and the stored choice;
     `buildEvent` adds `theme` and `theme_source`.
   - Check: tests pass, including the payload.
2. **The switch.**
   - `theme_change` joins `AnalyticsEvent`; the `CustomEvent` detail accepts it.
   - `theme-switch.ts` dispatches it on each change, with `{ choice }`.
   - Check: tests; on the preview, the switch works as before and the request (intercepted) carries
     the choice.
3. **The privacy note.**
   - The approved copy in `en.yaml` and `es.yaml`; `updated` set to the merge date.
   - Check: the built page in both languages against the approved copy.
4. **Publish and verify.**
   - Branch, pull request, CI, squash merge, each with Jesus's yes.
   - The tagged visit from the browser pane, checked through the connector.
   - The two insights created through the connector.
   - Check: the Done-when list.

## N — Norms

All of [norms.md](norms.md), in particular "No third-party requests at runtime, except one" and
"Works without JavaScript": without scripts nothing is recorded, as today.

## S — Safeguards

- No new request, storage key or cookie. The `theme` key from story 020 is unchanged.
- GPC, Do Not Track and the owner mark still stop every event, `theme_change` included.
- The insight "Conversions per week, by language" is not changed, and `theme_change` stays out of
  it.
- The page's appearance does not change, except the privacy note's text.

## Sync — 2026-10-15 (operations 1–3)

This section is authoritative where it differs from the operations above.

- **Op 1** (`9497538`). `themeOf` returns `theme` from the computed `color-scheme` and
  `theme_source`; `Base.astro` marks pages that pin their theme with `data-theme-pinned` (in the
  build, `/cv/` carries it and `/` does not); `buildEvent` sends both properties next to `locale`.
- **Op 2** (`2751801`). `theme_change` joins `AnalyticsEvent` through a new `TrackedAction`
  type, not `ConversionEvent`; `theme-switch.ts` sends it through the `conversion` channel with
  `{ choice }`, importing only types from `track.ts`.
- **Op 3** (`2848e6e`). The approved copy, in both languages, with `updated` 2026-10-15.
  - The analysis said no test held the note's text. The Spanish review test does: it compares
    every Spanish string with its approved row in `spdd/reviews/004a-es.md`, and it failed on
    the two changed sections. Both rows now hold the new text, marked
    *(approved 2026-10-15, story 022)*, in the same commit, since either change alone fails the
    tests.
- **CI on #41, first run: LCP over budget** (`8795209`).
  - 10 of the 14 Lighthouse jobs failed on LCP alone, between 1506 and 1517 ms against 1500.
  - Cause: `track.ts` imported `themeOf` and `readChoice` from `lib/theme`, which the switch's
    script also imports. Vite then stopped inlining the analytics and switch scripts and emitted
    them as two files plus a shared chunk: three requests before LCP.
  - Fix: `themeOf` moved to `track.ts` and takes `chosen` from the page instead of storage.
    `data-theme` is set only by a visitor's choice or by a pinned page, and a pinned page also
    carries `data-theme-pinned`, so the result is the same. Its tests moved to
    `tests/track.test.ts`.
  - The built home page has again 2 external scripts and 7 inline ones, as the published site.
- **Local slip, no effect.** While inspecting the build, a `git checkout main --` switched the
  working tree to `main` and a stash pop conflicted there. `main` was reset to its own commit
  (`064f782`, equal to `origin/main`), and the stash was reapplied on the branch. Nothing was
  lost or pushed.

**Verified on 2026-10-15:**
- Tests: 424 pass.
- On the preview (production build), in the browser pane:
  - Light, Dark, Dark again and Match system sent three `theme_change` events (`light`, `dark`,
    `system`); repeating Dark sent none;
  - the inputs `themeOf` reads were right in each case: system dark and system light on `/`,
    chosen light and dark, and `/cv/` pinned light;
  - after Match system, no cookie and no storage key.
  - No request reaches PostHog locally (no key, foreign host); the payload is covered by the
    unit tests, and arrival is checked on the published site in operation 4.
- `/privacy/` and `/es/privacy/` match the approved copy word for word, dated 15 October 2026.
