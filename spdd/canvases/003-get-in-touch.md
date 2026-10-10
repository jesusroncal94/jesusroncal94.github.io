# 003 — Get in touch

Story: [003](../stories/003-get-in-touch.md). Figma: Desktop Nav `3:6`, Contact `6:287`;
Mobile Contact `9:174`, Sticky contact bar `9:182`. Component: `Button 2:92`.

**Status:** implemented and synced on 2026-09-24. CV copy approved on 2026-09-24.

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

### Follow-up — the contact bar and reduced motion (started 2026-10-06)

Found during canvas 011's verification: the contact bar slides out of view and back with a
300 ms `translate` and `opacity` transition that runs whatever the visitor's motion
preference, against the norm "Motion respects prefers-reduced-motion". Jesus approved the fix
on 2026-10-06.

13. **The transition becomes `motion-safe:`.** `transition-[translate,opacity] duration-300`
    turns into `motion-safe:transition-[translate,opacity] motion-safe:duration-300`. With
    reduced motion the bar still hides when the contact section enters the view and comes back
    after it, at once instead of sliding. Check, on the production build at 390 px: with
    reduced motion the bar has no transition and still toggles `data-hidden`; without it, the
    300 ms transition is unchanged.

## N — Norms

All of [norms.md](norms.md). Event names are snake_case nouns plus a verb, and are defined
only in `track.ts`.

## S — Safeguards

- No phone number on the site or in the PDF.
- No form, no data collection, no cookies, no third-party script in Phase 1.
- The copy action never blocks the `mailto:` path: a failure falls back, it never dead-ends.

## Sync — 2026-09-24

Implemented. This section is authoritative where it differs from the operations above.

- **Runtime image.** Every Node service in `compose.yaml` now runs on
  `mcr.microsoft.com/playwright:v1.63.0-noble` (Node 24, Chromium preinstalled), not only a
  separate `pdf` service. Sharing one `node_modules` volume between Alpine (musl) and Ubuntu
  (glibc) would break native binaries such as sharp and esbuild. `playwright` is pinned to
  exactly `1.63.0` so it uses the image's browsers, and CI moved to Node 24 to match.
- **Dev server lock.** Astro 7 writes `.astro/dev.json` with the server's PID. A container
  killed from outside leaves it behind, and `--force` then kills whatever process owns that
  PID in the next container — npm itself. The `web` service deletes the file before starting.
- **Op 2.** Tracking and copying share one delegated listener in `src/scripts/contact.ts`.
  Copy applies to anchors carrying `data-email-copy`. The "Copied" label and the live-region
  text are passed in through data attributes, so the script holds no copy.
- **Op 3.** `EmailAction` wraps its button and its live region in a `display: contents` span,
  so it can sit directly in a flex row.
- **Op 5.** The contact bar hides while any `[data-contact-zone]` is in view: the Contact
  section on the home page and the end block of each case page, which has its own CTAs.
- **Op 6.** The contact section shows its two CTAs on mobile too. The mobile frame had none,
  but the bar hides exactly there, so without them the last screen would have no action.
- **Op 7.** `src/lib/cv.ts` owns the CV file name and path (`cvPath(locale)`), used by the
  hero, the bar, the contact section, case pages and the palette.
- **Op 8.** `/cv` renders with `Base`'s new `theme="light"` prop, so the light tokens are
  finally used. It is excluded from the sitemap. Its contact links get 24 px touch targets on
  screen only, because WCAG 2.2 target size failed without them; print is unchanged.
- **Op 9.** `npm run build` is `astro build && tsx scripts/render-cv.ts`.
- **Found during verification:** `formatMonth('2021')` invented "Jan 2021" for roles the
  profile dates by year only. It now returns the year, with a test.

**Verified on 2026-09-24:**
- **PDF:** 2 A4 pages. It lists every role, the email, LinkedIn and GitHub, and contains no
  phone number.
- **End-to-end in headless Chromium on the production build** (mobile 390 × 844 and desktop
  1440 × 900):
  - the contact bar is visible at the top, hides at the contact section and returns, and is
    absent on desktop;
  - "Email me" copies the address, shows "Copied" and does not navigate;
  - "Download CV" downloads `jesus-roncal-cv-en.pdf`;
  - Ctrl+K, typing "freya" and pressing Enter opens `/work/04-freya/`.
- **Mobile fold:** the last proof row ends at y = 715 and the contact bar sits at
  761–828 within 844, which closes story 001.
- **Lighthouse, six URLs × 3 runs, all assertions pass:**
  - the home page, the case pages and `/cv` score 100 in performance, accessibility and
    best practices;
  - SEO is 100 everywhere except `/cv`, which scores 0.63 because it is `noindex` on
    purpose.

**Approval (2026-09-24):** Jesus approved the CV copy. Two changes came out of the review:
- MindFortress gets a fourth highlight, the multi-agent orchestration across 8 messaging
  channels, and the schema now allows up to four per role. Stripe billing and
  `mindfortress-claude` stay out: the first is product work, and the second overlaps with the
  merge campaign and the `ai-agents` repository.
- The name is spelled "Jesús", fixed at the source in `cv-manager/profile.md` and
  re-exported, so future CVs inherit it. The PDF stays at two pages.

**Copy amendment, 2026-09-30.** MindFortress ended in 2026-09, and `profile.md` now leads with
the current role. The CV summary reads "Most recently Technical Lead on two AI products, and
currently AI Engineer on a third". Jesus approved it on 2026-09-30. The PDF is still two
pages.

## Sync — 2026-10-06 (operation 13, reduced motion)

- **Changed** (`af78527`): the contact bar's transition is `motion-safe:` only. It closes the
  finding recorded in canvas 011's Sync.
- **Verified on the production build** at 390 px, on `/` and `/work/02-cost-leak/`:
  - with `prefers-reduced-motion: reduce`, the bar's transition is `0s`, and it still hides at
    the end of the page (`data-hidden` set) and comes back at the top;
  - with `no-preference`, the transition is `0.3s` as before, with the same hiding.
- Tests: 273 pass; build checks pass. Lighthouse in the pull request's CI.

## Incident — 2026-10-08

Found while building story 014, by a keyboard run in Chromium, Firefox and WebKit.

- **What happened.** When the phone contact bar hides (`data-hidden`: moved below the screen
  and transparent, with `pointer-events: none`), its "Download CV" and "Email me" links still
  took keyboard focus. Tabbing through any page at 390 px landed twice on links nobody could
  see, in all three engines, against "a visible focus ring" in the accessibility safeguard
  (WCAG 2.4.7).
- **Cause.** Hiding was visual only: translate, opacity and pointer events. Nothing removed
  the links from the focus order or the accessibility tree.
- **Why it slipped through.** The focus checks so far measured whether a focused element was
  covered by a bar, and treated the contact bar's own links as part of it, shown or not.
- **Fix** (story 014's branch, approved by Jesus on 2026-10-08). The script that sets
  `data-hidden` also sets `inert` on the bar, so while hidden its links leave the focus order
  and the accessibility tree; they come back with the bar. Their actions stay reachable in the
  contact section and the case footers, which are what is in view when the bar hides.
- **Verified,** on the production build at 390 px: on `/`, `/es/` and `/work/02-cost-leak/`,
  at the top, the middle and the end, the bar is `inert` exactly when it is hidden, and its
  link takes focus exactly when it is shown. Tabbing forward and back through the same pages
  in all three engines never reaches the hidden bar.
- **Rule.** [norms.md](norms.md): anything hidden visually but kept in the page is also made
  `inert` (or `hidden`).

**Follow-up, 2026-10-09.** Found while verifying story 015; fix approved by Jesus that day.

- **What happened.**
  - **Focus dropped when the bar hid.** With focus on "Download CV" in the shown bar, scrolling
    to the end of a case page hid the bar and made it `inert`; Chromium and Firefox moved focus
    to the `body`, so the next Tab started again at the top of the page.
  - **The observer can be late.** In a freshly started WebKit, Tab reached the bar while the
    IntersectionObserver had not yet reported the contact zone (its first report came about
    500 ms later than usual), and on the home page the last footer link, "Built spec-first…",
    was focused while the shown bar still covered it entirely: 6 of 6 cold runs, about 1,060 ms
    after load.
- **Cause.** The bar decided to hide from the observer alone, and hid regardless of where focus
  was.
- **Why it slipped through.** The tab-through test treated the contact bar as hidden whenever
  its `offsetParent` was `null`, which is always true for a `position: fixed` element. It
  therefore never measured whether the shown bar covered a focused element, and flagged focus
  in the shown bar as focus in a hidden one; the first reading of the WebKit failure (2026-10-09)
  rested on that. The test now reads `data-hidden` and `display`.
- **Fix** (`ContactBar.astro`):
  - the bar hides only when a zone is in view **and** focus is not inside it; it stays while one
    of its links has focus, and hides when focus leaves (`focusout` with the `relatedTarget`);
  - every `focusin` on the page measures the zones at once and again on the next frame, so the
    bar does not wait for the observer when focus is what scrolled the page. Measuring on the
    next frame alone was not enough: the cold WebKit failure stayed at 6 of 6.
- **Verified,** on the production build:
  - focus in the bar and the page scrolled to the end: the bar stays with its focused link; Tab
    to its second link keeps it; Shift+Tab out of it hides it; Shift+Tab from the end never
    lands in it; back mid-page it shows. `/work/03-merge-campaign/` and `/es/`, Chromium,
    Firefox and WebKit: 30 of 30;
  - the cold WebKit home run: 6 of 6;
  - five rounds of tab-throughs in the three engines, the first on a cold container: `/`,
    `/es/` and `/work/02-cost-leak/` 18 of 18, both case 03 pages 12 of 12, cold WebKit on case 03
    2 of 2, every round; no focused element entirely hidden by either bar, focus never in the
    hidden bar;
  - no regression: story 015's end-to-end run 1,026 of 1,026, story 014's 105 of 105.
  - Lighthouse, pull request #26, run `38082625247`: every assertion passes; every page has
    median performance 1 and median LCP 1,354–1,361 ms. Four runs show TBT 186–465 ms, each the
    first run of its shard: the runner's cold start, as in #19 and #22.
- **Rule.** [norms.md](norms.md), under "Hidden means hidden to the keyboard too": an element
  that hides itself never strands focus, and does not rely on an observer alone.
