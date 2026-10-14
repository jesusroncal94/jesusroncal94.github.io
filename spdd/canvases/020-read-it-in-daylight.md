# 020 — Read it in daylight

Story: [020](../stories/020-read-it-in-daylight.md). Analysis:
[Phase 1.9](../analysis/phase-1-9-light-theme.md). Penpot: the light frames and the theme control
on the pages Home and Cases (see [../design.md](../design.md)).

**Status:** written on 2026-10-14. The story, the light frames, the theme control and its copy,
the Piedra palette, the 12 % light float shadow and decisions 1–5 were approved that day.

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
