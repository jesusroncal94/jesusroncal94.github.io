# Analysis — Phase 1.9: Read it in daylight

Step 3 of the SPDD flow for story [020](../stories/020-read-it-in-daylight.md), approved on
2026-10-14. Inputs:
- the light frames, the theme control and its copy, the Piedra palette and the 12 % float shadow,
  all approved on 2026-10-14 (see [../design.md](../design.md));
- `src/styles/tokens.css` and `global.css`;
- `src/layouts/Base.astro` and `OgCard.astro`;
- `LocaleSwitch.astro` and the phone menu;
- `scripts/render-artifacts.ts` and `lighthouserc.json`.

## 1. Diagnosis

| Piece | Today | What the story needs |
| ----- | ----- | -------------------- |
| Light tokens | Zinc values under `[data-theme='light']`, used only by `/cv/` | Piedra values, applied when the system asks for light or the visitor picks it |
| Theme selection | `Base.astro` writes `data-theme={theme}`, `'dark'` by default; `prefers-color-scheme` is ignored | No attribute by default, so the system decides; an attribute only for an explicit choice, or for pages that pin a theme (CV light, preview cards dark) |
| First paint | Dark always, so nothing can flash | Light from the first paint when the system asks for it, without scripts (a media query), and when the visitor chose it (an inline script in `<head>`, before the stylesheet paints) |
| Control | None | A three-way control in the nav (desktop) and the phone menu: Match system, Light, Dark |
| Float shadow | `0 12px 32px rgb(0 0 0 / 0.5)` in both themes | 12 % in light, as approved |
| CV | Light, from the zinc tokens | Its PDF and page are built from the same light tokens |
| Preview cards | `OgCard.astro` pins `data-theme="dark"` | Unchanged |
| Lighthouse | Headless Chrome reports `prefers-color-scheme: light` by default; today it changes nothing | Once the site follows the system, CI measures the light theme unless told otherwise. The dark theme then needs its own pass |

Hard-coded colours: none outside `tokens.css` (searched 2026-10-14). The glows use
`color-mix` on `--color-glow`, and the Contact gradient runs from canvas to dusk; all of them
follow the tokens.

## 2. Direction

### Decision 1 — How the theme is chosen

- **`tokens.css`:**
  - dark stays the default on `:root`;
  - the light values apply under `@media (prefers-color-scheme: light)` to
    `:root:not([data-theme='dark'])`, and always under `[data-theme='light']`.
  - `color-scheme` follows the same rules, so form controls and scrollbars match.
- **`Base.astro`:** `theme` becomes optional with no default. A page that passes nothing
  follows the system; `/cv/` keeps `theme="light"` and the preview cards keep `dark`.
- **Visitor's choice:** a script of a few lines, inlined in `<head>` before the stylesheet,
  reads `localStorage['theme']` (`light` or `dark`) and sets `data-theme` before the first paint.
  It is wrapped in `try`, so blocked storage falls back to the system. "Match system" removes the
  key and the attribute.
- **Without scripts:** the system setting still applies through the media query; only the control
  is unavailable.

### Decision 2 — The control

- **Markup:** a radio group of three native radio inputs, with the name "Theme" / "Tema" and
  each option labelled "Match system", "Light" or "Dark" ("Como el sistema", "Claro", "Oscuro").
  The icons are drawn with `aria-hidden`.
  - Native radios give the arrow-key behaviour and the announced state for free.
  - The visible segments reuse `LocaleSwitch`'s style.
  - The script syncs the checked radio with the stored choice on load.
- **Desktop:** the control sits before the language switch in the nav. **Phone:** it is a
  "Theme" row under "Language" in the menu, with 44 px targets (story 007's rule).
- **Without scripts** the control is hidden (`scripting: none`), because nothing could store the
  choice.

### Decision 3 — Palette and shadow

- **Palette:** `tokens.css` takes the Piedra light values approved for Penpot.
- **Shadow:** a token `--shadow-float` gets its light value `0 12px 32px rgb(0 0 0 / 0.12)` in
  the light rules.
- **The CV adopts Piedra.** It is a light page built from the same tokens. Keeping zinc only
  there would need a second light palette to maintain for one page. The story's line "the CV
  looks as it does today" is amended to "the CV stays light, at two pages". **Recommended**, and
  noted in the story with its date if confirmed.

### Decision 4 — Lighthouse in both themes

- **Light:** the existing run already measures it, since headless Chrome asks for light.
- **Dark:** a second pass of every URL with Chrome forced to dark. The working assumption is the
  flag `--blink-settings=preferredColorScheme=0`, to be verified on the runner before the sync
  claims it: one page's computed `color-scheme` is read in both passes.
- **Budget:** unchanged.
- **Cost:** CI time roughly doubles for Lighthouse (about 3 to 6 minutes per pull request).
  The alternative of measuring dark only on the home page and one case would halve that, but
  would leave twelve pages unchecked in the theme most visitors see today.

### Decision 5 — Checks

- **Unit tests:**
  - the inline script's logic (stored, absent and blocked storage);
  - the token parity test: every dark token has a light value.
- **End-to-end**, in Chromium, Firefox and WebKit, with `colorScheme` emulated light and dark:
  - the theme on first paint, with no flash (the computed canvas colour at `DOMContentLoaded`);
  - the control by mouse and keyboard, the choice kept after a reload, and "Match system"
    returning to the system;
  - `/cv/` stays light and the preview cards stay dark.
- **Overflow:** zero at 12 widths on `/` and one case page, in both themes.
- **Contrast:** every text token pair checked in Piedra (done for the palette choice; repeated
  in the sync from `tokens.css`).
- **Screenshots:** compared with the light frames.
- **Lighthouse:** decision 4.

## 3. Risks

| Risk | Mitigation |
| ---- | ---------- |
| A flash of the wrong theme for a visitor who chose against their system | The inline script runs before the stylesheet; the end-to-end run reads the canvas colour at `DOMContentLoaded` |
| The inline script breaks the "no new script" habit and the 15 KB budget | About 300 bytes, inline, no request; the home page budget is measured in CI |
| `localStorage` blocked (private mode, policies) | `try`/`catch`; the site follows the system |
| The CV changes colour | Decision 3, made explicit and approved, with the PDFs still at two pages |
| Lighthouse's dark flag does not apply on the runner | Verified before the sync claims a dark pass; if it fails, the gap is reported plainly |
| Visitors' preference is still unknown | Out of scope; recording the resolved theme in analytics could be a later, separate change |

## 4. Decisions

**⚠️ Pending:** Decisions 1–5, as recommended above, including the CV adopting Piedra and the
story's CV line being amended.
