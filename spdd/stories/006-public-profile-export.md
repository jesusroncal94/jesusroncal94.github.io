# 006 — Public profile export

**As** Jesus, the owner of the site
**I want** the site content generated from `cv-manager/profile.md`
**So that** my CV and my site never contradict each other and nothing private leaks

## Acceptance criteria

- WHEN the export runs
  THEN it writes `public-profile.json` into this repository from an allow-list of fields
- WHEN a field is not on the allow-list (salary, phone, deal-breakers, notes)
  THEN it never appears in the output
- WHEN a claim was softened by the confidentiality check
  THEN the public wording lives in an override file here, not in `cv-manager`

## Definition of done

- `cv-manager` stays local and gains no remote
- The export runs in Docker

## Note — 2026-10-14

`cv-manager` became a private GitHub repo (`jesusroncal94/cv-manager`), as a backup decided by
Jesus. The first definition-of-done item above held until then. The rule now, in `CLAUDE.md`:
it stays private, nothing beyond the export's allow-list is copied here, and this repo's CI never
gets access to it.
