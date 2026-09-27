# Analysis — Phase 1.1: responsive layout

Step 3 of the SPDD flow for story [007](../stories/007-reads-well-on-any-screen.md). Inputs:
the Playwright audit in the story, and the phone, tablet and desktop frames on the Home page of
the Penpot file (see [../design.md](../design.md)).

## 1. Diagnosis

The code has one breakpoint, `md` (768 px). Below it is the phone layout; above it is the
1440 px desktop frame with fixed widths: a 420 px portrait, a four-column timeline
(150 + 360 + 1fr + 130 px), four metric tiles, and 80 px gutters. Between 768 and 1279 px
those fixed widths do not fit, and above 1440 px nothing constrains the width.

## 2. Direction

### Three layouts, two breakpoints

| Layout | Width | Tailwind |
| ------ | ----- | -------- |
| Phone | < 768 px | base |
| Tablet | 768–1279 px | `md:` |
| Desktop | ≥ 1280 px | `xl:` |

`lg` (1024 px) is deliberately not used for layout. The audit shows the split hero and the
four-column grids do not fit at 1024, and a fourth layout would double the verification
surface for one band of widths.

### Content column

Backgrounds and section rules stay full-bleed. Content sits in a centred column, at most
1280 px wide (the desktop frame's 1440 minus its 80 px gutters), with gutters of 24 px on
phones, 40 px on tablets and 80 px on desktops.

### Fluid type

The display sizes interpolate linearly between the phone frame (390 px) and the desktop
frame (1440 px), clamped to both, so the two approved frames stay exact and everything in
between is proportional:

| Style | 390 px | 1440 px | `clamp()` |
| ----- | ------ | ------- | --------- |
| Display (headline, contact) | 44 px | 76 px | `clamp(2.75rem, 2.006rem + 3.048vw, 4.75rem)` |
| Display serif accent | 50 px | 84 px | `clamp(3.125rem, 2.336rem + 3.238vw, 5.25rem)` |
| Heading H2 | 32 px | 44 px | `clamp(2rem, 1.721rem + 1.143vw, 2.75rem)` |
| Metric L (before → after) | 34 px | 48 px | `clamp(2.125rem, 1.8rem + 1.333vw, 3rem)` |

This replaces the paired `*-mobile` utilities: one fluid utility per style.

### Per section

| Section | Phone | Tablet | Desktop |
| ------- | ----- | ------ | ------- |
| Nav | Menu sheet | Links + Email | As tablet |
| Hero | As today | Stacked: identity row (72 px avatar, name, role · city, status chip on the right), headline, lede, CTAs, prompt | Split, with the 420 px portrait and badges |
| Proof | 3 rows | 2 × 2 tiles | 4 tiles |
| Work | 1 column, "Two more cases" | 1 column, all four | 2 × 2 |
| Open source | 1 column | 1 column | 3 columns |
| Experience | Stacked, 4 rows + "earlier" | Two columns: period · role, organisation, line, place | Four columns |
| Principles | Rows | 3 columns | 3 columns |
| Section head | Stacked, no lede | Stacked, with lede | Title and lede side by side |
| Contact | Left-aligned | Centred | Centred |
| Contact bar | Shown | Hidden (the hero CTAs are visible) | Hidden |

### Wrapping rules

- A before → after panel wraps between its values, never inside one: each value is
  `white-space: nowrap`, and the panel is a wrapping flex row.
- Repository names may break anywhere (`overflow-wrap: anywhere`), since they are
  identifiers, not words.
- Below 380 px the contact bar hides its icons and tightens its padding, so both buttons
  fit at 320 px.

## 3. Risks

| Risk | Mitigation |
| ---- | ---------- |
| Tablets start downloading the 420 px portrait they no longer show | The `<picture>` sources move from `(min-width: 48rem)` to `(min-width: 80rem)`, so only desktops fetch it. On tablets the LCP is the headline, as on phones |
| Fluid headline changes line breaks in the approved frames | The clamp endpoints are the frame sizes, so 390 and 1440 render exactly as approved |
| A layout regresses at a width nobody looks at | The audit script becomes the verification step: zero overflow at 12 widths (320 to 2560 px), plus screenshots reviewed at 390, 834, 1024, 1280 and 1920 |
| Performance | The Lighthouse budget runs unchanged on every page |

## 4. Decision needed

**✅ Decision — mockups (2026-09-25).** The Figma Starter plan's MCP quota ran out while the
tablet frame was half built. Jesus chose to move the design to Penpot, which is free and has
an official MCP server hosted by Penpot. The design system (tokens with Dark and Light themes,
20 typographies, 7 components) and the three Home frames (phone 390, tablet 834, desktop 1440)
were rebuilt there from the same components. See [../design.md](../design.md).

Building the phone frame also exercised the wrapping rules of §2: the headline, the
before → after values, the stack tags and the contact actions overflowed until each row was
allowed to wrap. A check of every layer against the frame's width now finds no overflow in
the phone frame, which is the same contract the code must meet.

**✅ Approved on 2026-09-27:** Jesus approved the three frames.
