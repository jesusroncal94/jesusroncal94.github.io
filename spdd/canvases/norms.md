# Norms and safeguards shared by every canvas

## Norms

- **Self-documenting code.** Names and structure carry the meaning; comments only for
  what code cannot say. Small units, dependency inversion over inline explanation.
- **Tests cover the happy path** of the operation in scope, plus the privacy guard in 006.
  No coverage targets.
- **Docker only.** Every command runs through `compose.yaml`, invoked with `./tasks.ps1 <task>`.
  Nothing assumes Node on the host.
- **Conventional commits**, one per operation where practical:
  `<type>(<scope>): <subject>`, imperative, lowercase, no trailing period, no AI attribution.
- **Tokens, never literals.** Colours, spacing, radii and type come from
  `src/styles/tokens.css`, which mirrors the Figma variables. A hex value outside that file is
  a defect.
- **One Figma component, one Astro component**, with the same name and the same properties.
- **Every visible string comes from content or the i18n dictionary.** Components receive
  text; they never contain it.
- **Formatting through `Intl`** (numbers, dates, periods), keyed by locale.
- **Motion respects `prefers-reduced-motion`**: animations run only when it is `no-preference`.
- **Files:** Astro components in PascalCase, everything else in kebab-case.

## Safeguards

- **Nothing private reaches the repository.** No phone number, salary, deal-breaker, visa
  status or `cv-manager` note in any committed file or built page. Test fixtures included:
  anything private in a fixture uses synthetic values of the same shape.
- **Truthfulness.** Every fact traces to `cv-manager/profile.md`; every softened claim uses the
  approved wording. No metric is invented, rounded up or extrapolated.
- **Accessibility: WCAG 2.2 AA.** Text contrast ≥ 4.5:1 (the tokens already comply), every
  interactive element reachable and operable by keyboard with a visible focus ring, landmarks
  and headings in order, images with meaningful `alt`.
- **Performance budget (Lighthouse, mobile):** Performance ≥ 95, Accessibility 100,
  LCP ≤ 1.5 s, CLS ≤ 0.02, total JavaScript on the home page ≤ 15 KB gzipped.
- **Works without JavaScript.** Every link, the CV download and the email fallback function
  with scripts disabled; scripts only enhance.
- **No third-party requests at runtime** in Phase 1: no CDN fonts, no analytics, no embeds.
