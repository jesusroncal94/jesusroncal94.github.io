# 013 — Search engines know who this is

**As a** recruiter who searches for Jesus by name, or for the kind of engineer he is
**I want** the search result to recognise the site as his professional profile, with his name,
role, place and profiles, and his case studies as articles by him
**So that** the right result stands out, links to LinkedIn and GitHub are tied to the same
person, and I reach the site rather than a namesake

## Evidence (published site, 2026-10-07)

- No page carries structured data: `application/ld+json` appears 0 times on `/`, `/es/` and
  `/work/02-cost-leak/`.
- Pages describe themselves only through Open Graph (`og:title`, `og:description`, `og:image`,
  `og:url`, `og:locale`), which link previews read but search engines use only as loose hints.
- Every page declares `og:type` `website`, including the four case studies, which are articles.
- The facts structured data would carry are already in the public profile export
  (`data/public-profile.json`): name, city, LinkedIn and GitHub addresses, current role; and in
  the case collection: title, summary, preview image.

## Acceptance criteria

- WHEN a search engine reads the home page, in either language
  THEN it finds a profile page whose main entity is a person: his name as the site shows it, his
  role as the site states it, his city, the site's address, his portrait, and his LinkedIn and
  GitHub profiles as the same person
- WHEN it reads a case study, in either language
  THEN it finds an article with the case's title, summary, preview image and language, written
  by that same person
- WHEN structured data states a fact
  THEN the fact traces to the public profile export or to approved content, in the approved
  wording, and states nothing the visible page does not
- WHEN any other page is read (the CV page, the privacy note, the not-found page)
  THEN it carries no structured data that misdescribes it
- WHEN the profile or a case changes
  THEN the structured data changes with it, because it is generated at build time from the same
  sources

## Definition of done

- No frames: nothing visible changes. The analysis lists every property and its source, for
  approval before the canvas
- A build check fails if a page that should carry structured data does not, or if it does not
  parse as JSON
- Google's Rich Results Test, run by Jesus on the published home page and one case page, reports
  the items detected and no errors
- The Lighthouse budget still passes on every page
