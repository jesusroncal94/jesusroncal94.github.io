# Analysis — Phase 1.8: One CV, wherever it comes from

Step 3 of the SPDD flow for story [019](../stories/019-one-cv-wherever-it-comes-from.md), approved
on 2026-10-13. Inputs:
- `cv-manager/cv-base.md`, read locally and never copied;
- `scripts/export-profile.ts` and `src/lib/profile/`;
- `src/pages/[...locale]/cv.astro` and `scripts/render-artifacts.ts`;
- the `cv` block of `src/content/site/{en,es}.yaml`;
- the layout spike of 2026-10-13: the site's CV filled with `cv-base.md`'s text, rendered in the
  scratchpad (mockup approved the same day, see below).

## 1. Diagnosis

| Piece | Today | What the story needs |
| ----- | ----- | -------------------- |
| Source of the CV text | `profile.md` for the header, roles, education, skills and languages; the summary and up to 4 highlights per role written by hand in `site/*.yaml` | `cv-base.md` for the summary and every role bullet, the same text Jesus sends |
| Export | Reads `profile.md` only; carries no summary and no bullets | Also reads `cv-base.md`, and only its summary and role bullets |
| Privacy guard | `tests/profile.test.ts` proves no phone or private field from `profile.md` leaves the parser | The same proof for `cv-base.md`, whose contact line has two phone numbers |
| English CV | Hand-written, 13 highlights; differs from `cv-base.md` in wording and length | The exported text, word for word: a 97-word summary and 24 bullets (6, 8, 3, 3, 2, 1, 1) |
| Spanish CV | Reviewed translations of the hand-written English | A reviewed translation of the exported English; a change to the English fails the build until its Spanish is reviewed |
| Layout | 9.5 pt / 1.45, margins 12/14 mm, a role never breaks across pages | With `cv-base.md`'s text: 3 pages in English. Approved mockup: 9 pt / 1.4, margins 10/12 mm, roles may break, a bullet never does, a heading stays with its first bullet. 2 pages in English with a quarter of page 2 free; the Spanish CV stays at 2 pages up to 25 % longer than the English (the reviewed translations today run 14.5 % longer) |
| Page count | Checked by hand in canvas 003 | Checked by the build |

What already matches: education, skills and languages in `cv-base.md` read word for word as the
export from `profile.md` (compared on 2026-10-13). The role headings of both files share the
format the parser reads (`Title — Organisation, Location (start to end)`).

Not reachable from CI: `cv-manager` is local-only, so CI cannot tell whether the exported text is
the latest `cv-base.md`. Only a run on Jesus's machine can.

## 2. Direction

### Decision 1 — What of `cv-base.md` is published

`cv-base.md` was written to be sent to recruiters one by one, not to be on the open web. Publishing
it on the site is a different audience. The allow-list takes **only the summary and the role
bullets**, never the contact section. Before that, Jesus confirms that every bullet may be public.
These are the details most worth a second look:
- Intercorp: ~25K requests/month, 23K+ sessions and 362 active teachers in the latest cycle,
  ~$0.08 per session, 14.9K pregenerated sessions, monthly Executive Committee reporting and an
  approved budget band;
- MindFortress: "a stale worker pointed at the production database", `mindfortress-claude` and
  its integrations (Linear, Slack, Railway, Vercel, AWS, Sentry, Stripe), Railway / AWS operations;
- Pretty Technical's client, Elimbio (USA).

**Recommended:** publish them as they are if Jesus confirms. If one should not be public, it is
changed in `cv-base.md` itself, so the two CVs stay one; the site never edits the text.

### Decision 2 — The export

- `export-profile.ts` also reads `cv-base.md` (`/cv-manager/cv-base.md`, already mounted read-only
  in the export service).
- It takes:
  - the paragraph under `## Summary`;
  - the bullets under each `### role` of `## Experience`, with `**bold**` markers removed.
- Each role is matched to a role of the profile by the same id rule (`slugify` of the
  organisation). A role in one file and not the other fails the export.
- The result goes into `data/public-profile.json` as `summary` and `roles[].bullets`, so there is
  still one exported file. The schema stays `.strict()`, with string-only fields.
- **Privacy guard:**
  - comments are stripped first;
  - the export refuses any text that matches a phone pattern, and any email other than the public
    one;
  - the contact section of `cv-base.md` is never read.
  
  A synthetic `tests/fixtures/cv-base.md` carries fake phone numbers in its contact line, and the
  test proves none of them reaches the output.

### Decision 3 — The English and Spanish CVs

- **English:** `cv.astro` renders the exported summary and bullets. `cv.summary` and
  `cv.highlights` leave `en.yaml`. The schema's `max(4)` per role goes too, since the source
  decides.
- **Spanish:** `es.yaml` holds the translations as pairs, `{ source, text }`, where `source` is the
  English they were translated from.
  - The build fails if an exported English text has no pair with that exact `source`, which is
    the case when the English changed and has no reviewed Spanish yet.
  - It also fails if a pair's `source` is no longer exported.
- **Review:** each pair gets a row in `spdd/reviews/004a-es.md`, approved by Jesus: the summary and
  24 bullets, about 850 words of English (97 in the summary, about 750 in the bullets). The existing reviewed highlights are reused wherever
  the facts match, but the wording follows the new English.

### Decision 4 — Keeping the site in step with `cv-base.md`

- In CI, the guarantees are structural:
  - the site can only show exported English;
  - the Spanish fails when the English moves.
- On Jesus's machine, `./tasks.ps1 test` gains a check that re-parses `../cv-manager` (mounted
  read-only into the test service when it exists) and fails if `data/public-profile.json` differs
  from it. In CI, where `cv-manager` does not exist, the check reports that it was skipped; it
  never passes silently.
- The "before calling something done" list already runs `./tasks.ps1 test` locally, so a stale
  export cannot reach a pull request unnoticed.

### Decision 5 — Layout and page count

- `cv.astro`, as in the approved mockup:
  - 9 pt with a line height of 1.4;
  - `@page` margins of 10 mm by 12 mm, with the content filling the page width;
  - `article` may break across pages, a `li` never breaks, and a role's heading stays with its
    first bullet.
- The on-screen `/cv/` page takes the same type.
- `render-artifacts.ts` counts the pages of each PDF it renders, and fails the build above 2.

### Decision 6 — Checks

- **Unit tests:**
  - the export, with a synthetic fixture: summary, bullets, role matching, bold removed;
  - the privacy guard;
  - the translation pairs, for a missing pair and a stale pair.
- **Build:**
  - the page-count check;
  - the existing link, preview and structured-data checks.
- **Locally:**
  - the freshness check;
  - the English PDF's text compared with `cv-base.md` section by section;
  - both PDFs compared with the mockup.
- **CI:** Lighthouse on `/cv/` and `/es/cv/`; no other page changes.

## 3. Risks

| Risk | Mitigation |
| ---- | ---------- |
| A detail fit for a one-to-one CV is not fit for the web | Decision 1: Jesus confirms every bullet before the export carries it |
| A phone number or private note slips through a future edit of `cv-base.md` | The export reads only two sections, strips comments, refuses phone patterns, and the test proves it on a fixture that has them |
| `cv-base.md` gains a bullet and the Spanish CV reaches 3 pages | The build counts pages and fails; the layout leaves room for 25 % more in Spanish |
| Jesus edits `cv-base.md` and forgets the export | The local freshness check fails `./tasks.ps1 test`; CI cannot see `cv-manager`, and says so |
| The two CVs look different (fonts, colours) | Accepted: the text is the same, the design is the site's; the story asks for the same content, not the same file |
| A role is renamed in one file only | The export fails on a role present in one file and not the other |

## 4. Decisions

**✅ Decision 1 — What is published.** Confirmed 2026-10-13: the summary and every role bullet of
`cv-base.md`, as they are, the details listed above included; never the contact section.

**✅ Decision 2 — The export.** Confirmed 2026-10-13: summary and bullets into
`data/public-profile.json`, roles matched by id, and the privacy guard with a synthetic fixture.

**✅ Decision 3 — The English and Spanish CVs.** Confirmed 2026-10-13: English from the export;
Spanish as reviewed `{ source, text }` pairs that fail the build when missing or stale.

**✅ Decision 4 — Keeping in step.** Confirmed 2026-10-13: the local freshness check in
`./tasks.ps1 test`, reported as skipped in CI.

**✅ Decision 5 — Layout and page count.** Confirmed 2026-10-13: the approved mockup, and the
build fails above two pages.

**✅ Decision 6 — Checks.** Confirmed 2026-10-13: as listed.
