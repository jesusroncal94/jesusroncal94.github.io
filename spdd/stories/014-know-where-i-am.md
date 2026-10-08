# 014 — Know where I am

**As a** recruiter or hiring manager scrolling the home page, often on a phone
**I want** the navigation to show which section I am reading
**So that** I can tell at a glance how far through the page I am and what the links lead to,
without losing my place

## Evidence (production build, 2026-10-08)

Since story 011 the bar stays at the top, but its links look the same wherever the visitor is.
The home page is long, and the three linked sections are most of it:

| Viewport | Page | Work | Open source | Experience |
| -------- | ---- | ---- | ----------- | ---------- |
| 390 × 844 | 5,562 px, 6.6 screens | 1,435 px, 1.7 screens | 1,416 px, 1.7 screens | 776 px, 0.9 screens |
| 834 × 1112 | 7,954 px, 7.2 screens | 2,468 px, 2.2 screens | 1,317 px, 1.2 screens | 1,448 px, 1.3 screens |
| 1440 × 900 | 5,796 px, 6.4 screens | 1,428 px, 1.6 screens | 713 px, 0.8 screens | 1,072 px, 1.2 screens |

- The page has seven blocks: the hero, the proof strip, Work, Open source, Experience, How I
  work and Contact. The bar links only the middle three (`#work`, `#open-source`,
  `#experience`); "Email me" covers contact.
- The links carry no current state: no `aria-current`, no visual difference. A screen reader
  user hears the same three links on every part of the page.
- On phones the links live in the menu; opening it shows the same list wherever the visitor is.
- Case pages and the privacy note reuse the bar, but none of its sections are on those pages.

## Acceptance criteria

- WHEN a visitor scrolls the home page, in either language and at any width from 320 to 2560 px
  THEN the bar's link to the section being read is marked as current, and only that one
- WHEN the visitor is in a part of the page the bar does not link (the hero, the proof strip,
  How I work, Contact)
  THEN no link is marked
- WHEN a link is marked
  THEN it is announced as the current location to assistive technology (`aria-current`), and
  the mark is visible without relying on colour alone and keeps WCAG AA contrast
- WHEN the visitor opens the phone menu
  THEN the link to the section being read is marked there too
- WHEN the visitor jumps to a section, from the bar, the command palette or a URL with a
  `#fragment`
  THEN that section's link is the one marked once the jump ends, with no flicker through the
  sections in between that stays on screen
- WHEN the visitor is on a case page, the privacy note, the CV page or the 404 page
  THEN no link is marked
- WHEN scripts are disabled
  THEN the bar looks and works as it does today
- WHEN the visitor prefers reduced motion
  THEN the mark changes without animation
- WHEN the page loads or the mark changes
  THEN nothing shifts

## Definition of done

- Desktop and phone frames of the bar with a section marked, plus the phone menu opened with
  one marked, exist in Penpot and are approved before code
- An end-to-end check scrolls the home page in both languages at a phone and a desktop width
  and confirms the marked link for every block, including none on the hero, How I work and
  Contact, and after a jump from each link
- The overflow audit reports zero overflow at all 12 widths on `/` and a case page
- The Lighthouse budget still passes on every page, in CI
