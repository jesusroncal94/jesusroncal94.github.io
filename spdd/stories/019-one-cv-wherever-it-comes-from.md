# 019 — One CV, wherever it comes from

**As a** recruiter who has Jesus's CV from LinkedIn or an email and opens the one on his site
**I want** both to say the same thing
**So that** I trust what I read, and do not have to work out which version is current

This story follows the case 04 attribution incident of 2026-10-13 (canvas 002). The incident
showed that texts written by hand from `cv-manager` drift without anything flagging it, and that
the CV on the site and the CV Jesus sends are two documents.

## Evidence (2026-10-13)

- **Two CVs, two sources.**
  - Jesus sends recruiters, and links on LinkedIn, `cv-manager/output/CV_Jesus_Roncal.pdf`,
    rendered from `cv-manager/cv-base.md` (English only).
  - The site's "Download CV" serves `cv/jesus-roncal-cv-{en,es}.pdf`, rendered at build time
    from `data/public-profile.json` (header, roles, education, skills, languages) plus a summary
    and highlights written by hand in `src/content/site/{en,es}.yaml`.
- **They already differ.**
  - The summaries cover the same facts in different words; the site's is shorter.
  - `cv-base.md` gives the MindFortress role 8 bullets; the site's CV keeps at most 4 per role,
    worded independently.
  - On 2026-10-13, `cv-base.md` merged the two Freya bullets into one so its PDF stays at two
    pages; the site's highlight was rewritten separately the same day (#32).
- **The `cv-manager` PDF cannot be published as it is.** Its contact line carries two phone
  numbers, which the "Nothing private reaches the repository" safeguard of `norms.md` forbids.
- **The export does not carry the CV text.** It carries the header and the roles, but no summary
  and no bullets, so a change in `cv-base.md` never reaches the site.
- **Only the site has a Spanish CV.** It is a reviewed translation of the site's English
  highlights (`spdd/reviews/004a-es.md`).

## Acceptance criteria

- WHEN a visitor downloads the English CV from the site
  THEN its summary and every role bullet read word for word as in the CV Jesus sends
- WHEN the site's CV is compared with the one Jesus sends
  THEN they differ only in what may not be published: no phone number or other private field
  reaches the site, its repository or its build
- WHEN `cv-base.md` changes and the export is run
  THEN the site's CV follows without hand edits, and a build that still carries the old text
  fails rather than publishing it
- WHEN a visitor downloads the Spanish CV
  THEN it is a reviewed translation of that same English text, and a change to the English
  that has no reviewed Spanish yet fails the build
- WHEN either PDF is opened
  THEN it is at most two pages, as today
- WHEN the CV page or the case studies are read
  THEN nothing else on the site changes

## Definition of done

- The export allow-list, and what it leaves out, are approved before code
- Any change to the CV's layout is shown in a mockup and approved before code
- The Spanish translation of every changed text is reviewed and approved
- The privacy test proves that no phone number, `cv-manager` note or other private field from
  `cv-base.md` reaches `data/` or `dist/`
- The English PDF matches the text of `cv-base.md` section by section, and both PDFs are at most
  two pages
- Tests, build checks and the Lighthouse budget pass in CI
