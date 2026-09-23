# 003 — Get in touch

Story: [003](../stories/003-get-in-touch.md). Figma: Desktop Nav `3:6`, Contact `6:287`;
Mobile Contact `9:174`, Sticky contact bar `9:182`. Component: `Button 2:92`.

## R — Requirements

A recruiter who is convinced can act immediately.

- Email is at most one tap away anywhere: the nav button on desktop, the sticky bar on
  mobile.
- "Download CV" downloads the PDF for the current locale directly, with no form.
- "Email me" copies the address and confirms it visibly, with a `mailto:` fallback.
- The footer lists LinkedIn, GitHub and email, and never the phone.
- Contact actions emit named conversion events. Phase 1 only emits them; PostHog is
  connected in Phase 4 (analysis decision 4).
- The CV PDF is generated from a print-styled `/cv` page at build time (analysis
  decision 3).

**Done when:** the three actions work with and without JavaScript (without it, "Email me"
opens `mailto:`); `dist/cv/jesus-roncal-cv-en.pdf` exists after `./tasks.ps1 build` and
reads correctly on two A4 pages at most; the deploy workflow produces it too.

## E — Entities

```ts
type ConversionEvent = 'cv_download' | 'email_copy' | 'email_open' | 'profile_open'
track(event: ConversionEvent, props?: Record<string, string>): void
CvDocument = PublicProfile + editorial summary + the approved role one-liners
```

## A — Approach

Declarative tracking: elements carry `data-track="<event>"`, and one delegated click listener
calls `track`. The Phase 1 `track` does nothing, so Phase 4 changes a single function. The
email action is progressive: a real `mailto:` link that, when the Clipboard API is available,
copies instead and announces "Copied" through a polite live region, with the `mailto:` still
offered next to it.

The CV is an Astro page (`/cv`, `noindex`) built from the same content as the site, styled
for print (A4, 12 mm margins, black on white, Geist). After `astro build`, a script starts
Astro's programmatic `preview()`, opens `/cv/` in headless Chromium through Playwright, and
writes `page.pdf()` into `dist/cv/`. Locally that runs in the official Playwright image; in
CI, after `npx playwright install --with-deps chromium`.

## S — Structure

```
src/lib/track.ts
src/scripts/contact.ts              delegated tracking and the copy-email enhancement
src/components/EmailAction.astro
src/components/ContactBar.astro
src/sections/Contact.astro          CTA block and footer
src/pages/cv.astro                  print layout
scripts/render-cv.ts
compose.yaml                        + service `pdf` (mcr.microsoft.com/playwright, repo at /app)
package.json                        + devDependency playwright; build → astro build && tsx scripts/render-cv.ts
.github/workflows/deploy.yml        + Playwright browser install before the build
```

## O — Operations

1. **`src/lib/track.ts`**: exports `type ConversionEvent` and `track(event, props?)`, which
   returns immediately.
2. **`src/scripts/contact.ts`**: one `click` listener on `document` that finds the closest
   `[data-track]` and calls `track`. For `[data-email-copy]` it prevents the default,
   `navigator.clipboard.writeText(address)`, swaps the label to "Copied" with the check icon
   for 2 s, and writes the confirmation into the live region. If the Clipboard API is
   missing or throws, the `mailto:` default runs.
3. **`EmailAction.astro`**: props `variant`, `label`. Renders
   `<a href="mailto:…" data-email-copy data-track="email_copy">` through `Button`, plus the
   visually hidden live region. The address comes from `public-profile.json`.
4. **`Nav.astro`** (from 001): the "Email me" button becomes an `EmailAction`.
5. **`ContactBar.astro`** (`9:182`): below `md` only; fixed 16 px from the bottom and sides;
   pill with a translucent surface, backdrop blur and a strong border; primary "Download CV"
   and an `EmailAction`, each half the width. It hides while the Contact section is in view
   (an `IntersectionObserver` toggling `data-hidden`), and adds bottom padding to `body` so it
   never covers the footer.
6. **`Contact.astro`** (`6:287` / `9:174`): section `id="contact"` with the violet gradient.
   The headline has "that holds up." in the serif accent, then the sub-line, then the primary
   "Download CV" (`href="/cv/jesus-roncal-cv-en.pdf"`, `download`,
   `data-track="cv_download"`) and an `EmailAction` showing the address. The footer holds
   © 2026, LinkedIn ↗ and GitHub ↗ (`data-track="profile_open"`, new tab), Email, and
   "Built spec-first with SPDD · source ↗" linking to this repository.
7. **All "Download CV" buttons** (hero, contact bar, case pages) share the same `href`,
   `download` and `data-track="cv_download"`.
8. **`pages/cv.astro`**: `<meta name="robots" content="noindex">`. A4 print CSS with
   `@page { size: A4; margin: 12mm }`, no navigation, light colours. Content:
   - the name and headline;
   - one contact line (city · email · LinkedIn · GitHub);
   - the summary, from `site.cvSummary`, approved copy;
   - experience: each role with its period and the approved one-liner, plus up to three
     approved achievement bullets per role from `site.cvHighlights`;
   - education, skills (grouped) and languages.
9. **`scripts/render-cv.ts`**: `preview({ root, server: { port: 4322 } })`, launch
   Chromium, `goto('http://localhost:4322/cv/')`, wait for `document.fonts.ready`,
   `page.pdf({ path: 'dist/cv/jesus-roncal-cv-en.pdf', format: 'A4', printBackground: true })`,
   then close both. The locales come from `PUBLISHED_LOCALES`.
10. **`compose.yaml`** gains a `pdf` service on the Playwright image (tag matching the
    `playwright` package version); **`tasks.ps1 build`** runs the build in that service so
    the PDF is produced locally too.
11. **Deploy workflow**: add `npx playwright install --with-deps chromium` before
    `npm run build`.
12. **Check**: `pdftotext dist/cv/jesus-roncal-cv-en.pdf -` contains the name, the email and
    every role, and contains no phone pattern; the PDF is at most two pages.

## N — Norms

All of [norms.md](norms.md). Event names are snake_case nouns plus a verb, and are defined
only in `track.ts`.

## S — Safeguards

- No phone number on the site or in the PDF.
- No form, no data collection, no cookies, no third-party script in Phase 1.
- The copy action never blocks the `mailto:` path: a failure falls back, it never dead-ends.
