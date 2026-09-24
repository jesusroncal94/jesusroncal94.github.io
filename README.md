# jesusroncal94.github.io

My personal site: who I am, the production AI work I have done, and how to reach me. It is
a static Astro site deployed to GitHub Pages.

It is also built the way I build software. Every feature starts as a user story, gets a
mockup in Figma, an analysis and a structured prompt (a REASONS canvas), and only then
becomes code. Those artefacts live next to the code in [`spdd/`](spdd/), and they are kept in
sync with it.

## How it is built

The process is [Structured-Prompt-Driven Development](https://martinfowler.com/articles/structured-prompt-driven/):

| Step | Artefact |
| ---- | -------- |
| Stories with WHEN/THEN acceptance criteria | [`spdd/stories/`](spdd/stories/) |
| Mockups and design tokens | [Figma](https://www.figma.com/design/Ni2dXlZEpSN9HwhSGafsXU), summarised in [`spdd/design.md`](spdd/design.md) |
| Analysis: concepts, direction, risks, decisions | [`spdd/analysis/`](spdd/analysis/) |
| REASONS canvases, one per story | [`spdd/canvases/`](spdd/canvases/) |
| Code, one commit per canvas operation | this repository |

## How the code is organised

```
src/
  styles/     design tokens mirrored from the Figma variables, and the type scale
  i18n/       locales, UI dictionary, Intl formatters
  layouts/    the HTML shell: SEO, hreflang, font preloads
  pages/      routes, including /cv, the source of the PDF
  lib/        content access, the public-profile parser, palette and timeline logic
tests/        happy-path tests for the pure modules
```

English is served at `/`; Spanish and Italian routes are wired in but not yet published.

## Running it

Everything runs in Docker; nothing needs Node on the host.

```powershell
./tasks.ps1 dev       # http://localhost:4321 with hot reload
./tasks.ps1 test
./tasks.ps1 build     # static output in dist/
./tasks.ps1 preview   # build, then serve dist/ at http://localhost:4321
./tasks.ps1 export    # regenerate data/public-profile.json from ../cv-manager
./tasks.ps1 fonts     # re-subset the fonts after the content gains new characters
```

## Deploying

Every push to `main` runs the tests, builds the site, checks it against a Lighthouse budget,
and deploys to GitHub Pages. The build fails, and nothing deploys, when any of these is
missed on mobile:

- Performance score of at least 95
- Accessibility score of 100
- LCP of at most 1.5 s
- CLS of at most 0.02
- At most 15 KB of JavaScript
- No third-party requests

## Deliberate simplifications

- **Dark only.** The light tokens are used by the printable CV at `/cv`, which becomes the
  downloadable PDF at build time; the site itself has no theme toggle yet.
- **Fonts are self-hosted**, never loaded from a CDN, for performance and GDPR.
- **No UI framework.** The few interactive pieces are plain TypeScript.

## License

The code is MIT — see [LICENSE](LICENSE). The written content and the photographs are
© Jesus Roncal, all rights reserved.
