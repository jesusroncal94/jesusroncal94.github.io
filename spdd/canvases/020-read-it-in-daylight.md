# 020 — Read it in daylight

Story: [020](../stories/020-read-it-in-daylight.md). Analysis:
[Phase 1.9](../analysis/phase-1-9-light-theme.md). Penpot: the light frames and the theme control
on the pages Home and Cases (see [../design.md](../design.md)).

**Status:** implemented on 2026-10-14. The story, the light frames, the theme control and its copy,
the Piedra palette, the 12 % light float shadow, decisions 1–5 and the canvas start were approved
that day. The dark Lighthouse pass is pending its check on the runner.

## R — Requirements

The site follows the visitor's system appearance from the first paint, light or dark, and a
three-way control lets the visitor override it and keeps the choice. The light theme uses the
Piedra palette. The CV stays light and the preview cards stay dark. Both themes meet AA, keep the
layout and pass the Lighthouse budget.

**Done when:**
- Unit tests pass for the theme script and for token parity.
- End-to-end, in Chromium, Firefox and WebKit, with the system emulated light and dark:
  - every page paints in the system's theme, with no flash;
  - the control works by mouse and keyboard, the choice survives a reload, and "Match system"
    returns to the system;
  - without scripts the control is hidden and the system still applies;
  - `/cv/` is light and a preview card is dark, whatever the system.
- Overflow is zero at all 12 widths on `/` and one case page, in both themes.
- Every text token pair clears 4.5:1 in Piedra, computed from `tokens.css`.
- Screenshots match the light frames.
- The Lighthouse budget passes in CI in the light pass and in the dark pass, the dark flag shown
  to apply on the runner.

## E — Entities

```css
/* src/styles/tokens.css */
@theme { … dark values …; --shadow-float: 0 12px 32px rgb(0 0 0 / 0.5) }
@media (prefers-color-scheme: light) { :root:not([data-theme='dark']) { …Piedra… } }
[data-theme='light'] { …Piedra… }
```

```ts
// src/lib/theme.ts
type ThemeChoice = 'light' | 'dark' | 'system';
THEME_KEY = 'theme';
readChoice(storage): ThemeChoice        // 'system' when absent, invalid or storage throws
applyChoice(root, storage, choice)      // sets or removes data-theme and the stored key
```

## A — Approach

Decisions 1–5 of the analysis: the media query for the system, an inline head script for an
explicit choice, a native radio group for the control, Piedra and a softer light shadow in the
tokens, and a second, dark Lighthouse pass.

## S — Structure

```
src/styles/tokens.css                    Piedra light values; media query; --shadow-float in both themes
src/styles/global.css                    color-scheme follows the same rules
src/lib/theme.ts                         readChoice, applyChoice
src/scripts/theme-boot.ts                the inline head script (built from theme.ts)
src/scripts/theme-switch.ts              syncs and drives the radio group
src/components/ThemeSwitch.astro         the control
src/layouts/Base.astro                   theme optional, no default; inlines the boot script
src/components/{Nav,…}.astro             the control before the language switch; the phone menu row
src/i18n/ui/{en,es}.ts                   theme.label, theme.system, theme.light, theme.dark
tests/theme.test.ts                      readChoice and applyChoice
tests/tokens.test.ts                     every dark token has a light value
lighthouserc.json + the workflow         a dark pass
spdd/reviews/004a-es.md                  + 4 rows
```

## O — Operations

1. **Tokens.**
   - Piedra replaces the light values.
   - The media query and `color-scheme` rules are added.
   - `--shadow-float` becomes a token with a light value, and the components that use the
     shadow read it.
   - `Base.astro`'s `theme` prop loses its default.
   - Check:
     - `tests/tokens.test.ts` passes;
     - with the system emulated dark every page is unchanged against `main`;
     - with it light every page is light;
     - `/cv/` is light and the preview cards are dark;
     - both PDFs are two pages.
2. **The choice.**
   - `theme.ts` with its tests.
   - The boot script is inlined in `<head>` before the stylesheet.
   - Check: a stored `light` on a dark system, and a stored `dark` on a light system, each paint
     the chosen theme at `DOMContentLoaded`.
3. **The control.**
   - `ThemeSwitch.astro`, placed in the nav and in the phone menu, with its script and the four
     UI strings in both languages and their review rows.
   - Check:
     - mouse and keyboard;
     - the choice is kept;
     - "Match system" returns;
     - hidden without scripts;
     - 44 px targets on the phone;
     - screenshots against the frames.
4. **Lighthouse dark pass.**
   - The workflow runs every URL a second time with Chrome forced dark.
   - Check: on the runner, one URL's computed `color-scheme` is `dark` in that pass and `light`
     in the other.
5. **Check,** on the production build: the Done-when list.

## N — Norms

All of [norms.md](norms.md), in particular "Tokens, never literals", "Works without JavaScript",
"Motion respects prefers-reduced-motion" (the switch does not animate the page), and the
keyboard rules for pinned elements.

## S — Safeguards

- No request: the boot script is inline, and no font or asset is added.
- The dark theme, as most visitors see it today, is unchanged: every page with the system
  emulated dark is compared with `main`.
- No analytics change.

## Sync — 2026-10-14 (operations 1–5)

This section is authoritative where it differs from the operations above.

- **Op 1** (`61ca692`). Not two duplicated light blocks, as the entities showed. Every colour token
  is one `light-dark(light, dark)` value, and the root's `color-scheme` picks the side:
  - dark by default;
  - light under `@media (prefers-color-scheme: light)` unless `data-theme='dark'`;
  - light under `data-theme='light'`.
  
  One list cannot drift between the system path and the chosen one. `light-dark()` works in all
  three engines since 2024.
  - **Float shadow:** Tailwind inlines theme shadows into its utilities, so the light value could
    not be swapped through `--shadow-float`. The shadow now reads `var(--float-shadow)`, itself a
    `light-dark()` of 12 % and 50 %.
  - **`tests/tokens.test.ts`:** checks that every colour has both values and that every text
    token clears 4.5:1 on canvas, surface and raised in both themes, as does white on signal.
  - **Against the published site (`main`),** with the system emulated dark: the full-page
    screenshots of 12 pages at 390 and 1440 px are identical, except `/cv/` and `/es/cv/`, which
    move from zinc to Piedra as decided.
  - **With the system emulated light:** every page paints the Piedra canvas with
    `color-scheme: light`.
  - The 10 preview cards are byte-identical.
- **Op 2** (`fc16211`). `bootTheme` is inlined from `theme.ts` as source text, about 230 bytes,
  and skips a page that already pins `data-theme`. Seven cases ran in each engine, 21 in all, each
  reading the canvas colour on the first painted frame, and all pass:
  - a stored choice against the system;
  - no stored choice;
  - an invalid value;
  - `/cv/` with a stored `dark`.
  
  A first version read the colour at `DOMContentLoaded`. On `/cv/`, WebKit fires that event
  before the stylesheet has loaded, with no sheets at all, whether or not a choice is stored, and
  the check failed falsely. Since nothing paints before the stylesheet, the check now reads the
  first frame after that event.
- **Op 3** (`f22b113`).
  - `ThemeSwitch.astro` is a `fieldset` of native radios with a hidden legend; the icons are
    `aria-hidden`.
  - It shows only under the new `scripted` variant (`@media (scripting: enabled)`).
  - The desktop segments are 36 × 28 px. The phone menu row uses 48 × 44 px targets.
  - Now that the switch is in every page's nav, the dark pages are no longer identical to `main`:
    they gain the switch and nothing else.
  - The end-to-end run, 63 checks, passes in Chromium, Firefox and WebKit, in English and
    Spanish:
    - the system is the default;
    - Light by mouse is kept across a reload;
    - Dark by ArrowRight, and back to the system by ArrowLeft, which forgets the choice;
    - the group's and options' names;
    - no overflow;
    - 44 px or more on the phone;
    - Dark from the phone menu on a light system;
    - hidden without scripts while the system still applies.
  - A first screenshot seemed to show Light unselected. It was taken during the 150 ms colour
    transition; read after it, Light is the selected segment in both switches.
- **Op 4** (`b4335ba`).
  - The Lighthouse matrix gains `scheme: [light, dark]`, 14 jobs. The dark pass adds
    `--blink-settings=preferredColorScheme=0`.
  - Artefacts are named by shard and scheme. Sharding uses `matrix.shard` and 7, no longer the job
    index.
  - Locally, Lighthouse 12 with the container's Chromium paints the home page light without the
    flag and dark with it, as its final screenshot shows.

**Verified on 2026-10-14, on the production build:**
- Tests: 402 pass, the freshness check included. Build checks: links, previews and structured
  data valid on 15 pages; both CV PDFs are two pages.
- Overflow: zero at all 12 widths on `/`, `/work/04-freya/`, `/es/` and `/es/work/04-freya/`, in
  both themes.
- Screenshots match the light frames and the switch in both themes:
  - the home page at 1440 px, light;
  - case 04 at 390 px, light;
  - the nav at 1440 px, dark and light;
  - the phone menu, light.
- Contrast: by `tests/tokens.test.ts`, from `tokens.css` itself. The lowest light ratios are
  subtle 5.0:1 on raised, signal 6.2:1, and white on signal 7.1:1.
- Lighthouse, both passes, and the dark flag on the runner: in the pull request's CI, to be added
  here.
