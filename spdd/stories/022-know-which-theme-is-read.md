# 022 — Know which theme is read

**As** Jesus, the owner of the site
**I want** to know which theme each visit is read in, and whether visitors use the theme switch
**So that** I can decide on evidence how much more to invest in the light theme, instead of on
the convention that story 020 rested on

## Evidence (2026-10-15)

- **The light theme shipped without measured demand.** Story 020 says so in its evidence: the
  analytics record neither the colour scheme nor the switch.
- **The analytics already carry per-event properties.**
  - `buildEvent` in `src/lib/track.ts` adds `locale` and the `utm_*` tags to every event.
  - Adding a property needs no new request and no new endpoint.
- **The theme a page is read in is known in the page.**
  - With `data-theme` set, it is the visitor's choice.
  - Without it, it is the system's, readable through `prefers-color-scheme`.
  - The stored choice is read by `readChoice` in `src/lib/theme.ts`.
- **The switch emits nothing.** `src/scripts/theme-switch.ts` applies and stores the choice, with
  no event.
- **The privacy note is out of date since story 020.**
  - Under "What is not", it says "Nothing is stored in your browser".
  - Since 2026-10-14, a visitor who picks Light or Dark has their choice stored under the
    `theme` key in `localStorage`. "Match system" removes it.
  - The note also does not list the theme among what is recorded, which this story would add.
- **Story 009's definition of done** asked for no new storage key in a visitor's browser. The
  `theme` key is set only by the visitor's own action and never sent anywhere. The note must
  still say so.

## Acceptance criteria

- WHEN a page view or any other event is recorded
  THEN it carries the theme the page is shown in (`light` or `dark`), and whether that comes from
  the visitor's choice or from the system
- WHEN a visitor uses the theme switch
  THEN a `theme_change` event is recorded with the choice made (`light`, `dark` or `system`) and
  the page it was made on
- WHEN Global Privacy Control, Do Not Track or the owner's mark is present
  THEN nothing is recorded, as today
- WHEN the theme is measured
  THEN no new storage key, cookie or request is added, and the switch behaves exactly as before
- WHEN a visitor reads the privacy note
  THEN it lists the theme among what is recorded, and it says that a theme picked with the switch
  is kept in the browser, only for that purpose, and is never sent
- WHEN Jesus opens the dashboard
  THEN he sees, per week, visits split by theme and by its source, and the number of switch uses
  by choice

## Definition of done

- The privacy note's new copy is approved in English and Spanish before code, and its "Updated"
  date changes
- A test asserts the theme properties on an event in each case (system light, system dark,
  chosen light, chosen dark), and the `theme_change` payload
- Events from the published site are seen arriving in the dashboard with the theme properties,
  and a `theme_change` event for each choice
- The Lighthouse budget still passes in CI, in both themes
- The dashboard has the theme insights, and their names are recorded in the canvas

**✅ Approved on 2026-10-15:** the story as written, without new Penpot frames: nothing visible
changes but the privacy note's copy, whose frame exists since story 009.
