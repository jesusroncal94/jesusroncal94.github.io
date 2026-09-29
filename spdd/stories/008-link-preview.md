# 008 — Link preview

**As a** recruiter who receives Jesus's link in LinkedIn, an email, Slack or WhatsApp
**I want** the link to unfold into a card that already tells me who he is and what he did
**So that** I recognise a relevant candidate before I click, and I click

## Evidence (2026-09-30)

The published home page has `og:title`, `og:description` and `og:url`, but no `og:image`,
and `twitter:card` is `summary`. Shared links unfold into a text-only card. The case pages
have no image either, and `og:locale` is `en` rather than the `en_US` form Open Graph
expects.

## Acceptance criteria

- WHEN the home page link is shared
  THEN the card shows a 1200 × 630 image with the photo, the name, "AI & Backend Engineer",
  the headline "I ship LLM systems that survive production." and the site address
- WHEN a case page link is shared
  THEN the card shows that case's own image: its title, its before → after metric and
  "Jesús Roncal · <organisation>"
- WHEN the image is shown as a small thumbnail (about 400 px wide)
  THEN the name and the headline or metric are still readable
- WHEN any page is shared
  THEN it declares `og:image` as an absolute URL with its width, height and alt text, plus
  `twitter:card` `summary_large_image` and `og:locale` in `ll_TT` form
- WHEN the content of the site changes
  THEN the images change with it: they are generated at build time from the same content,
  never drawn by hand

## Definition of done

- A frame for each image (home and case) exists in Penpot and is approved before code
- Every image is PNG or JPEG, 1200 × 630, and under 300 KB, the limit WhatsApp enforces
  for previews
- A build check fails if an indexable page has no `og:image`, or if the image it declares
  does not exist in the output
- The LinkedIn Post Inspector shows the card for the home page and one case page. Jesus runs
  this check, because it needs his LinkedIn session
- The Lighthouse budget still passes on every page
