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
