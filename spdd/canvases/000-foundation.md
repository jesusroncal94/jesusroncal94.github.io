# 000 — Foundation

Enables every Phase 1 story. Figma: Foundations `2:3`.

**Status:** implemented and synced with the code on 2026-09-23.

## R — Requirements

A static Astro site that builds and runs entirely in Docker, renders the approved tokens
and fonts, has i18n routing in place with only English published, and deploys to GitHub
Pages on every push to `main` after passing Lighthouse CI.

**Done when:** `./tasks.ps1 build` produces `dist/`; `./tasks.ps1 dev` serves the site at
`http://localhost:4321`; a push to `main` publishes to `https://jesusroncal94.github.io`; the
Lighthouse job fails the workflow when a budget from [norms.md](norms.md) is broken.

## E — Entities

- `Locale`: `'en' | 'es' | 'it'`. `DEFAULT_LOCALE = 'en'`. `PUBLISHED_LOCALES = ['en']`
  until story 004.
- `UiDictionary`: a typed record of every UI string, one per locale; English is the type's
  source of truth, so a missing key in another locale is a type error.
- Theme tokens: the colour, dimension and type values from [../design.md](../design.md).

## A — Approach

Astro 7 in static mode with built-in i18n routing (`prefixDefaultLocale: false`), so English
lives at `/` and other locales at `/es/`, `/it/`. Tailwind 4 through its Vite plugin, with
the tokens declared in `@theme` so utilities such as `bg-canvas` and `text-muted` exist.
Fonts are self-hosted through Fontsource. A custom GitHub Actions workflow (rather than
`withastro/action`) builds the site, because story 003 adds a PDF render step after the
Astro build.

Phase 1 is dark only: it is the approved design. Light tokens ship in `tokens.css` behind
`[data-theme="light"]`, unused until a theme toggle is designed.

## S — Structure

```
package.json            scripts: dev, build, preview, test
astro.config.mjs
tsconfig.json           extends astro/tsconfigs/strict
compose.yaml            services: web, build, preview, test (node:22-alpine, repo mounted at /app)
tasks.ps1
lighthouserc.json
LICENSE                 MIT for the code; content reserved (stated in the README)
public/favicon.svg
src/
  styles/tokens.css
  styles/typography.css
  styles/global.css
  i18n/locales.ts
  i18n/ui/en.ts
  i18n/translate.ts
  i18n/format.ts
  layouts/Base.astro
  pages/index.astro     placeholder until 001
.github/workflows/deploy.yml
README.md
```

## O — Operations

1. **`package.json`**: `"type": "module"`; dependencies `astro@^7.3`, `tailwindcss@^4.3`,
   `@tailwindcss/vite@^4.3`, `@astrojs/sitemap@^3.7`, `motion@^13.4`,
   `@fontsource-variable/geist`, `@fontsource-variable/geist-mono`,
   `@fontsource/instrument-serif`; devDependencies `vitest`, `tsx`, `zod`. Scripts:
   `dev: astro dev --host`, `build: astro build`, `preview: astro preview --host`,
   `test: vitest run`.
2. **`compose.yaml`**: service `web` (`npm run dev`, port `4321:4321`), `build`
   (`npm ci && npm run build`), `preview` (build, then `npm run preview` on port 4321) and
   `test` (`npm run test`). All use `node:22-alpine`, mount `.` at `/app`, keep
   `node_modules` and the npm cache in named volumes so the Windows host never sees them,
   and set `WATCH_MODE=polling` and `ASTRO_TELEMETRY_DISABLED=1`.
3. **`tasks.ps1`**: `param([ValidateSet('dev','build','preview','test')] $Task)`, each
   mapping to `docker compose run --rm --service-ports <service>`. Canvas 006 adds `export`.
4. **`astro.config.mjs`**: `site: 'https://jesusroncal94.github.io'`, `output: 'static'`,
   `i18n: { defaultLocale: 'en', locales: ['en','es','it'], routing: { prefixDefaultLocale: false } }`,
   `integrations: [sitemap()]`, `vite: { plugins: [tailwindcss()] }`, and file-watch
   polling when `WATCH_MODE=polling` (bind mounts from Windows do not emit change events).
5. **`src/styles/tokens.css`**: `@theme` with `--color-canvas`, `--color-surface`,
   `--color-raised`, `--color-border`, `--color-border-strong`, `--color-primary`,
   `--color-muted`, `--color-subtle`, `--color-signal`, `--color-on-signal`, `--color-glow`,
   `--color-before`; `--radius-sm|md|lg`; `--font-sans: 'Geist Variable'`,
   `--font-mono: 'Geist Mono Variable'`, `--font-serif: 'Instrument Serif'`. Light values
   under `[data-theme="light"]`.
6. **`src/styles/global.css`**: `@import 'tailwindcss'`, the tokens and the type scale; the
   three metric-matched fallback faces (`Geist Fallback` on Arial, `Geist Mono Fallback` on
   Courier New, `Instrument Serif Fallback` on Times New Roman), with overrides computed by
   Capsize rather than estimated; `body` gets `bg-canvas text-primary font-sans antialiased`;
   `::selection` uses the signal colour; `:focus-visible` draws a 2px signal outline offset
   by 3px. The web fonts themselves are imported in `Base.astro` from Fontsource, whose faces
   already use `font-display: swap`; Instrument Serif is limited to italic 400.
7. **Type utilities** in `src/styles/typography.css` as `@utility` blocks mirroring the Figma text styles, in rem:
   `display-xl`, `display-serif`, `display-mobile`, `heading-h2`, `heading-h3`, `metric-l`,
   `metric-m`, `body-l`, `body-m`, `body-s`, `label-mono` (uppercase, +6% tracking),
   `code-mono`, `button-m`. Values exactly as in Figma.
8. **`src/i18n/locales.ts`**: exports `LOCALES`, `DEFAULT_LOCALE`, `PUBLISHED_LOCALES`,
   `type Locale`, `localePath(locale, path)` returning `/path` for English and `/es/path`
   otherwise.
9. **`src/i18n/ui/en.ts`** exports `const en = { … } as const` with the nav, CTA, section
   eyebrow and footer strings from the mockups; **`translate.ts`** exports
   `useTranslations(locale): (key: keyof typeof en) => string`.
10. **`src/i18n/format.ts`**: `formatNumber(value, locale, options?)`,
    `formatMonth(yyyyMm, locale)` (e.g. `Sep 2024`), `formatPeriod(start, end | null, locale)`
    (e.g. `2024 — now`), all through `Intl`. Test: `tests/format.test.ts`, English happy path.
11. **`src/layouts/Base.astro`**: props `locale`, `title`, `description`, `image?`; sets
    `<html lang>`, `data-theme="dark"`, canonical, `hreflang` alternates for
    `PUBLISHED_LOCALES` plus `x-default`, Open Graph and Twitter tags, the favicon, and
    preloads the Latin subsets of Geist and Instrument Serif Italic. The `theme-color` meta
    is left out: it would need a colour literal outside `tokens.css`. `noindex?` is
    accepted for the `/cv` page in 003.
12. **`.github/workflows/deploy.yml`**: on push to `main` (and on manual dispatch): job
    `build` runs checkout, setup-node 22 with the npm cache, `npm ci`, `npm run test`,
    `npm run build`, the Lighthouse budget (`treosh/lighthouse-ci-action` over `dist/` with
    `lighthouserc.json`), then `actions/upload-pages-artifact`; job `deploy` (needs build)
    runs `actions/deploy-pages`. Lighthouse runs inside the build job rather than in its own
    job, so it audits the exact `dist/` without passing artifacts between jobs. Permissions:
    `contents: read`, `pages: write`, `id-token: write`.
13. **`lighthouserc.json`**: `staticDistDir: ./dist`, three runs, Lighthouse's default mobile
    emulation, and the assertions from the performance budget in [norms.md](norms.md) (the
    median run for timing metrics). Verified locally on the Playwright image with
    `@lhci/cli`.
14. **`README.md`** following the account's skeleton: what it is, how the code is
    organised, how to run it (`./tasks.ps1`), how it deploys, deliberate simplifications,
    licence.

### Follow-up — `tasks.ps1` stops when stderr is redirected (started 2026-10-03)

Reproduced on 2026-10-03 under Windows PowerShell 5.1.26100. `./tasks.ps1 test` passes when
run plainly, but with `2>&1`, `2>$null` or `*>` it stops at Docker's first progress line on
stderr ("Container … Creating"): once stderr is redirected, PowerShell 5.1 wraps each native
stderr line in an error record, and `$ErrorActionPreference = 'Stop'` makes the first one
terminating. Jesus approved the fix on 2026-10-03.

15. **`tasks.ps1` drops `$ErrorActionPreference = 'Stop'`.** The script runs one native
    command and already returns its result with `exit $LASTEXITCODE`; `ValidateSet` still
    rejects an unknown task before anything runs. Check: the four invocations above finish
    with Docker's exit code, a failing test returns a non-zero code even with `2>&1`, and an
    unknown task is rejected.

## N — Norms

All of [norms.md](norms.md). Additionally: dependency versions pinned with caret ranges and a
committed `package-lock.json`; no `postinstall` scripts.

## S — Safeguards

- The repository must be public for free GitHub Pages: before the first push, re-check that
  `design/photo-source.jpg` is the only personal asset and that `data/` holds only the export.
- Pages is configured to deploy from GitHub Actions, not from a branch.

## Sync — 2026-09-23 (from canvas 002)

- **Fonts are subset at design time.** `scripts/subset-fonts.sh`, run by
  `./tasks.ps1 fonts` in `python:3.12-slim`, uses fontTools to restrict Geist to weights
  400–600 and Geist Mono to 400–500, and keeps only Latin-1, typographic punctuation, arrows,
  `−` and `⌘`. It writes the results to `src/assets/fonts/`, which are committed:
  `geist.woff2` 17 KB, `geist-mono.woff2` 13 KB, `instrument-serif-italic.woff2` 20 KB,
  74 KB before. `src/styles/fonts.css` declares them, and `Base.astro` preloads Geist and the
  serif. The Fontsource packages are now dev dependencies that only feed the script. Re-run
  it when the content gains characters outside that set (story 004: Latin-1 already covers
  Spanish and Italian).
- **`motion` was removed.** Nothing needs it: the one animation (count-up) is a small
  `requestAnimationFrame` loop.
- **Stylesheet delivery.** Inlining was tried in canvas 001 and reverted in 002. See the sync
  note there.

## Sync — 2026-09-30 (robots.txt)

After the first publication `/robots.txt` returned 404, so crawlers were never told where
the sitemap is. `public/robots.txt` now allows everything and points to
`https://jesusroncal94.github.io/sitemap-index.xml`.

- `/cv` is deliberately not disallowed. It is already `noindex`, and blocking the crawl would
  stop crawlers from seeing that tag.
- The file holds the domain as text. When `jesusroncal.dev` is configured, its `Sitemap` line
  changes together with `site` in `astro.config.mjs`.

## Sync — 2026-10-03 (`tasks.ps1` and redirected stderr)

This section is authoritative where it differs from operation 15.

- **Op 15.** `tasks.ps1` no longer sets `$ErrorActionPreference`; it is otherwise unchanged.
  Commit `15631cf`.
- **Correction.** The Syncs of canvas 009 ("Found, outside this canvas") and 004a
  (2026-10-03) say that `./tasks.ps1` fails under Windows PowerShell 5.1. It failed only when
  its stderr was redirected, as an agent or a log capture does; run plainly in a console it
  passed.

**Verified on 2026-10-03,** under Windows PowerShell 5.1.26100:
- `./tasks.ps1 test` run plainly, with `2>&1`, with `2>$null` and with `*>` to a file: all four
  run the suite to the end (270 tests pass) and return exit code 0. Before the fix the last
  three stopped at "Container … Creating".
- With a temporary failing test, deleted afterwards: exit code 1, run plainly and with `2>&1`.
- `./tasks.ps1 nope` is rejected by `ValidateSet` before Docker runs.
- No container is left behind by the aborted runs before the fix.
