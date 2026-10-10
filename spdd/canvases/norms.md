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
- **Links carry their page.** A component rendered on more than one page never links with a
  bare fragment (`#work`). Links to home sections are built from `localePath(locale)`
  (`/#work`); a bare fragment is only for a target inside the same component. After every
  build, `scripts/check-links.ts` fails if any internal link points to a page or `id` that
  does not exist.
- **Pinned elements are tested with the keyboard on a scrolled page.** Scroll padding that
  clears a pinned bar also covers the bar itself, so anything focusable inside the bar opts out
  with a negative `scroll-margin-top` (`nav-pinned`). Any change to the bar, the scroll padding
  or another pinned element is checked by focusing its controls with the page scrolled, in
  Chromium, Firefox and WebKit: the page must not move.
- **Hidden means hidden to the keyboard too.** An element hidden only visually (translated off
  screen, transparent, `pointer-events: none`) but kept in the page is also made `inert`, or
  `hidden`, so that it leaves the focus order and the accessibility tree with it.
  An element that hides itself never strands focus: it stays while it holds focus, and it does
  not rely on an observer alone to know when to hide, since the focus that scrolls the page can
  arrive before the observer reports.

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
- **No key or token in the repository, not even a public one.** Keys come from build-time
  environment variables (`PUBLIC_*` for the few the browser needs), set in CI as repository
  variables. Locally they are absent, so a local build sends nothing anywhere. Added
  2026-10-02 after the incident in canvas 009.
- **A performance claim is measured where it is enforced.** A Lighthouse comparison that
  decides whether a change regresses the budget runs in CI, or is confirmed there before it is
  written down. A local container simulates a different machine. Added 2026-10-02, same
  incident.
- **No third-party requests at runtime, except one:** since Phase 4 (2026-10-02), the
  analytics event to `eu.i.posthog.com`, and nothing else. No CDN fonts, no embeds, no
  third-party scripts.
