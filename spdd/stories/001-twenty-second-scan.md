# 001 — Twenty-second scan

**As a** recruiter screening AI Engineer candidates
**I want** to understand who Jesus is, what level he works at, and whether he fits my role
**So that** I can decide in under twenty seconds whether to open his CV

## Acceptance criteria

- WHEN the page loads on a 390px-wide phone
  THEN the name, the role headline, three proof metrics and the "Download CV" action are
  visible without scrolling
- WHEN the page loads on a 1440px desktop
  THEN the same content plus the photo and the Ask prompt are visible above the fold
- WHEN a proof metric is shown
  THEN it states a measured outcome with its context (e.g. "45.6% → 100% structural
  conformance") and never a skill label
- WHEN the recruiter looks for location and availability
  THEN "Based in Milan · open to roles across the EU" is visible in the hero

## Definition of done

- Largest Contentful Paint under 1.5s on a mid-range phone (Lighthouse mobile)
- Every metric traces to a line in `profile.md` and passed the confidentiality check
