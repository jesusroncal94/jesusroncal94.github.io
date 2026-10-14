# jesusroncal94.github.io

My personal site: who I am, the production AI work I have done, and how to reach me. It is
a static Astro site deployed to GitHub Pages.

It is also built the way I build software. Every feature starts as a user story, gets a
mockup in Penpot, an analysis and a structured prompt (a REASONS canvas), and only then
becomes code. Those artefacts live next to the code in [`spdd/`](spdd/), and they are kept in
sync with it.

**[`docs/`](docs/README.md) explains the process, the architecture and the privacy boundary in
three diagrams.** Start there.

## How it is built

The process is [Structured-Prompt-Driven Development](https://martinfowler.com/articles/structured-prompt-driven/):

| Step | Artefact |
| ---- | -------- |
| Stories with WHEN/THEN acceptance criteria | [`spdd/stories/`](spdd/stories/) |
| Mockups and design tokens | Penpot, summarised in [`spdd/design.md`](spdd/design.md); the Phase 1 record stays in [Figma](https://www.figma.com/design/Ni2dXlZEpSN9HwhSGafsXU) |
| Analysis: concepts, direction, risks, decisions | [`spdd/analysis/`](spdd/analysis/) |
| REASONS canvases, one per story | [`spdd/canvases/`](spdd/canvases/) |
| Code, one commit per canvas operation | this repository |

## How the code is organised

```
src/
  styles/     design tokens mirrored from Penpot, as light-dark() values, and the type scale
  i18n/       locales, UI dictionary, Intl formatters
  layouts/    the HTML shell: SEO, hreflang, font preloads
  pages/      routes, including /cv, the source of the PDF
  lib/        content access, the public-profile parser, palette and timeline logic
tests/        happy-path tests for the pure modules
```

English is served at `/` and Spanish at `/es/`; Italian routes are wired in but not yet
published.

## Running it

Everything runs in Docker; nothing needs Node on the host.

```powershell
./tasks.ps1 dev       # http://localhost:4321 with hot reload
./tasks.ps1 test
./tasks.ps1 build     # static output in dist/
./tasks.ps1 preview   # build, then serve dist/ at http://localhost:4321
./tasks.ps1 export    # regenerate data/public-profile.json from ../cv-manager
./tasks.ps1 diagrams  # post-process SVGs exported from Penpot into docs/diagrams/
./tasks.ps1 fonts     # re-subset the fonts after the content gains new characters
```

## Deploying

Changes reach `main` through pull requests, and `main` requires the `build` check. The same
workflow runs on every pull request and on every push to `main`:

1. **`site`** runs the tests and builds the site once, with its link and preview checks.
2. **`lighthouse`** audits every published page and the not-found page against the budget
   below, in fourteen parallel jobs: seven shards, one page in both languages each (the first
   also takes the not-found page), each run once in the light theme and once in the dark one,
   three runs per page. It is skipped when a change touches only documentation that never
   reaches the site: `spdd/`, `docs/`, `.claude/skills/`, `README.md`, `CLAUDE.md`.
3. **`build`** passes only if both did, and gathers the reports into one
   `lighthouse-results` artifact.
4. **`deploy`** publishes to GitHub Pages, on `main` only.

The check fails, and nothing deploys, when any of these is missed on mobile:

- Performance score of at least 95
- Accessibility score of 100
- LCP of at most 1.5 s
- CLS of at most 0.02
- At most 15 KB of JavaScript
- At most one third-party request: the cookieless analytics event to PostHog's EU endpoint

## Deliberate simplifications

- **Two themes, one token list.** The site follows the system's light or dark setting, or the
  visitor's choice; the printable CV at `/cv`, which becomes the PDF at build time, is always
  light.
- **Fonts are self-hosted**, never loaded from a CDN, for performance and GDPR.
- **No UI framework.** The few interactive pieces are plain TypeScript.

## License

The code is MIT — see [LICENSE](LICENSE). The written content and the photographs are
© Jesus Roncal, all rights reserved.
