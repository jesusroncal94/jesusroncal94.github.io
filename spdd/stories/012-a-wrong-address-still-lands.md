# 012 — A wrong address still lands

**As a** recruiter who follows a link that is broken, mistyped or cut short (pasted from an
email, a LinkedIn message or an old CV)
**I want** to land on Jesus's site, told plainly that the page does not exist, with the way on
**So that** a bad link costs me one click, not the impression that the site is broken

## Evidence (published site, 2026-10-06)

Every address that does not exist returns GitHub's own page, "Page not found · GitHub Pages"
(9,379 bytes), with no name, no navigation and no link back:

| Address | Status | Page |
| ------- | ------ | ---- |
| `/does-not-exist/` | 404 | GitHub Pages |
| `/es/no-existe/` | 404 | GitHub Pages, in English |
| `/work/99-missing/` | 404 | GitHub Pages |
| `/es/work/99-missing/` | 404 | GitHub Pages, in English |

- The site has no `404` page of its own. GitHub Pages serves one file, `404.html` at the root,
  for every missing address, whatever its language.
- A case link with a typo in the slug, or a link to a page that might be renamed one day, is
  the likeliest way in. Today that visitor leaves without seeing the site.
- The analytics never see these visits, because GitHub's page carries no tracker, so broken
  inbound links cannot be found and fixed.

## Acceptance criteria

- WHEN a visitor opens an address on the site that does not exist
  THEN they see a page in the site's design, with the pinned navigation, a short message that
  the page does not exist, and links to the home page, the case studies and the email
- WHEN the missing address starts with `/es/`
  THEN the message and the links are in Spanish and lead to the Spanish pages; otherwise they
  are in English
- WHEN the address looks like a case page (`/work/…` or `/es/work/…`)
  THEN the page offers the four case studies by name
- WHEN a search engine or a link preview reads the page
  THEN it is marked not to be indexed, is absent from the sitemap, and still answers with the
  404 status
- WHEN scripts are disabled
  THEN the page still shows its message and working links
- WHEN the analytics are allowed (same gates as every page)
  THEN the visit is counted with the missing address, so broken inbound links can be found

## Definition of done

- Desktop and phone frames of the page exist in Penpot, in English and Spanish, and they and
  the page's copy are approved before code
- The published site answers `/does-not-exist/`, `/es/no-existe/`, `/work/99-missing/` and
  `/es/work/99-missing/` with status 404 and this page, in the right language
- The overflow audit reports zero overflow on the page at all 12 widths
- The link check and the Lighthouse budget pass, with the page audited like the others
- The privacy note still states only what the code does
