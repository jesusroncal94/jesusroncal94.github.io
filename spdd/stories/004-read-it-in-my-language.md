# 004 — Read it in my language

**As a** visitor whose browser is in Spanish or Italian
**I want** the site in my language with local formats
**So that** it reads as written for me

## Acceptance criteria

- WHEN the browser language is `es` or `it` and the visitor lands on `/`
  THEN a dismissible suggestion to switch language appears; there is no automatic redirect
- WHEN the visitor switches language
  THEN they land on the same section of `/es/` or `/it/`
- WHEN numbers, currency and dates are rendered
  THEN they follow the locale (`12K` / `12 mil` / `12.000`, `$1.50` / `1,50 $`,
  `Sep 2024` / `sept. 2024` / `set 2024`)
- WHEN the Italian version is shown
  THEN it says honestly that Jesus is learning Italian (A2)
- WHEN a search engine crawls any locale
  THEN `hreflang` alternates and a localised title, description and OG image are present

## Definition of done

- The Italian copy has been reviewed by a native speaker before launch
