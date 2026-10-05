# 011 — Navigation always within reach

**As a** recruiter or hiring manager reading the site, often on a phone
**I want** the navigation bar to stay at the top of the screen while I scroll
**So that** I can jump to work, open source, experience, the other language or the email at any
point, without scrolling all the way back up

## Evidence (production build, 2026-10-05)

The header is in the page flow (`position: relative`): it scrolls away with the first screen
and comes back only at the very top.

| Viewport | Page | Length | Header |
| -------- | ---- | ------ | ------ |
| 390 × 844 | `/` | 5,562 px, 6.6 screens | 64 px |
| 390 × 844 | a case page | 2,550 px, 3.0 screens | 64 px |
| 834 × 1112 | `/` | 7,954 px, 7.2 screens | 86 px |
| 1440 × 900 | `/` | 5,796 px, 6.4 screens | 86 px |

- On the home page, "Experience" starts 3,605 px down on a phone and "Contact" 4,925 px down.
  A visitor reading a case who wants the email or another section has to scroll back through
  everything they read.
- On phones the fixed contact bar already keeps "Download CV" and "Email me" at the bottom, but
  the section links and the language switch live only in the header's menu.
- The section anchors carry `scroll-mt-4` (16 px). A bar pinned at the top would cover a
  section's heading after a jump unless that offset grows with it.

## Acceptance criteria

- WHEN a visitor scrolls any page that has the navigation (home, case pages, privacy note), in
  either language and at any width from 320 to 2560 px
  THEN the bar stays visible at the top of the viewport, with the monogram, the section links
  or the menu, the language switch and "Email me" as they are today
- WHEN the bar sits over content
  THEN the content underneath does not show through in a way that hurts reading: its text keeps
  the contrast it has today (WCAG AA)
- WHEN a visitor jumps to a section, from the bar, the command palette, a "Next case" link or a
  URL with a `#fragment`
  THEN the section's heading lands fully visible below the bar
- WHEN a keyboard user moves focus through the page
  THEN the focused element is never hidden behind the bar (WCAG 2.2, 2.4.11 Focus Not Obscured)
- WHEN the phone menu is opened while the page is scrolled
  THEN it opens under the bar and every link in it works, as it does at the top today
- WHEN the page loads or is scrolled
  THEN nothing shifts: the bar takes the same space at the top that it takes today
- WHEN scripts are disabled
  THEN the bar still stays at the top
- WHEN the visitor prefers reduced motion
  THEN the bar does not animate

## Definition of done

- Desktop, tablet and phone frames of a scrolled page, plus the phone menu opened while
  scrolled, exist in Penpot and are approved before code
- On a 390 × 844 phone, the pinned bar and the contact bar together leave at least 80 % of the
  screen height for content
- The overflow audit reports zero overflow at all 12 widths on `/` and a case page, in both
  languages
- An end-to-end check jumps to every home section and to a case's `#result`, and tabs through a
  page, confirming no heading or focused element sits under the bar
- The Lighthouse budget still passes on every page, in CI
