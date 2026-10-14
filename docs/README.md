# How this site is built

This is Jesús Roncal's personal site: a static Astro site, in English and Spanish, served by GitHub
Pages. It is also a working example of how he builds software with coding agents: every change
starts as a user story and reaches the site only through checks and his explicit yes. This folder
explains how, in three diagrams; the rules agents follow are in [CLAUDE.md](../CLAUDE.md) and the
artefacts of each change in [spdd/](../spdd/).

## Read in this order

| Page | What it explains |
|---|---|
| [Process](process.md) | How a change goes from a story to the published site, and where Jesus decides |
| [Architecture](architecture.md) | The parts of the site and how content flows from a private repository to visitors |
| [Privacy](privacy.md) | What may leave the private repository, and the checks on every crossing |
| [Design](design/README.md) | The diagrams' visual language, their Penpot source and how to change them |

## The site in one paragraph

Facts about Jesus live in a private repository, `cv-manager`. An export on his machine copies an
allow-list of them into this repository; the Astro build turns them, with the case studies and
the site's copy, into pages, a two-page CV in PDF and preview cards, and fails on anything it
cannot check. CI runs the tests and the Lighthouse budget in both themes, and GitHub Pages serves
the result. Visitors' browsers make one request beyond the site, cookieless analytics to PostHog
in the EU. Each change follows Structured-Prompt-Driven Development: story, mockups, analysis,
canvas, code one operation at a time, verification, and a sync of what really ran.
