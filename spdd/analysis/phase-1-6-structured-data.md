# Analysis — Phase 1.6: Search engines know who this is

Step 3 of the SPDD flow for story [013](../stories/013-search-engines-know-who-this-is.md),
approved on 2026-10-07. No frames: nothing visible changes. Inputs: the story's evidence,
`Base.astro`, the home and case pages, `data/public-profile.json`, `src/content/site/*.yaml`,
`src/i18n/ui/*.ts`, the case collection, and `scripts/check-previews.ts` as the model for a
build check.

## 1. Diagnosis

| Piece | Today | What structured data needs |
| ----- | ----- | -------------------------- |
| `Base.astro` | Open Graph and Twitter tags; `og:type` is `website` on every page | One place to emit a `<script type="application/ld+json">` per page, and `og:type` `article` on cases |
| Name | The site shows `site.displayName`, "Jesús Roncal"; the export holds the full name, "Jesús Enrique Roncal Huatta" | A name the page itself shows |
| Role | The preview card shows `og.role`, "AI & Backend Engineer", in both languages (job titles stay English, decision 2 of 004a) | The same words |
| Place | The hero shows the city from the export, "Milan, Italy", as "Milan" | Locality and country |
| Portrait | The hero builds it with `getImage` into hashed files | An absolute address to one of them |
| Profiles | The export's `contact.linkedin` and `contact.github`, linked from the contact section | `sameAs` |
| Cases | Title, summary, preview image and language per case, all approved | `Article` fields |
| Build checks | Links and previews are checked after every build | The same for structured data |

## 2. Direction

### Decision 1 — What each page declares

| Page | Type | Why |
| ---- | ---- | --- |
| `/`, `/es/` | `ProfilePage` whose `mainEntity` is a `Person` | Google's documented type for a page about one person; it ties the profiles to the person |
| `/work/<slug>/`, `/es/work/<slug>/` | `Article`, `author` pointing to the same `Person` by `@id` | Each case is a written piece by him |
| `/cv/`, `/es/cv/`, `/privacy/`, `/es/privacy/`, the 404 page | Nothing | The CV and the 404 are `noindex`; the privacy note is not about him |

The `Person` has one `@id`, `https://jesusroncal94.github.io/#person`, so every page that
mentions him points to the same entity.

### Decision 2 — Every property and its source

**`Person`** (on the home pages, referenced from the cases):

| Property | Value | Source |
| -------- | ----- | ------ |
| `@id` | `https://jesusroncal94.github.io/#person` | `site` in `astro.config.mjs` |
| `name` | Jesús Roncal | `site.displayName`, as every page shows it |
| `jobTitle` | AI & Backend Engineer | `og.role`, approved, shown on the preview card |
| `address` | `PostalAddress`, `addressLocality` Milan, `addressCountry` IT | Export `city`, "Milan, Italy", as the hero shows it |
| `url` | the home page of the page's language | `localePath` |
| `image` | the 840 px WebP portrait, absolute | The hero's `getImage` output |
| `sameAs` | the LinkedIn and GitHub addresses | Export `contact.linkedin`, `contact.github` |

**`ProfilePage`:** `url` and `inLanguage` of the page, `name` the page title, `mainEntity` the
`Person`.

**`Article`** (each case): `headline` the case title, `description` its summary, `image` its
preview card's absolute, versioned address, `inLanguage`, `url`, `mainEntityOfPage` the case
address, `author` `{ "@id": …#person }`.

Left out on purpose: email (spam bait), employer (it changes, and the role already says what he
does), dates of publication (no case has one; inventing them would break the truthfulness norm),
and the full name (decision 3).

### Decision 3 — The full name

| Option | Verdict |
| ------ | ------- |
| **A. `name` only, "Jesús Roncal"** | **Recommended.** It states only what every page shows, as story criterion 3 asks. LinkedIn and GitHub are tied to the person through `sameAs` anyway |
| B. Add `alternateName` "Jesús Enrique Roncal Huatta" | Matches the LinkedIn profile's name, which may help a search for the full name. It is a fact in the export, but the site never shows it, so it would need Jesus's explicit approval to publish |

### Decision 4 — How it is built and checked

- `src/lib/structured-data.ts` builds plain objects: `personEntity`, `profilePage`,
  `caseArticle`, from the same sources the pages already use. A unit test covers the happy path
  of each.
- `Base` takes an optional `structuredData` object and renders it as one
  `<script type="application/ld+json">`, escaped so a `<` in content cannot close the tag. The
  script is data, not code: browsers never run it and Lighthouse does not count it as script.
- `Base` takes an optional `ogType` (default `website`); case pages pass `article`.
- `scripts/check-structured-data.ts` runs after the build, like the link and preview checks: it
  fails if a home or case page has no structured data, if it does not parse, or if its `@type`
  or required fields are missing; and if any other page carries some.

### Decision 5 — Verification outside the build

Google's Rich Results Test on the published home page and one case, run by Jesus because it
is a form on Google's site, must report the items detected and no errors. Warnings about
optional properties that are left out on purpose (such as `datePublished`) are expected and
recorded, not fixed by inventing values.

## 3. Risks

| Risk | Mitigation |
| ---- | ---------- |
| Structured data says something the page does not | Every value comes from a source the page already renders (decision 2); the check compares nothing it cannot read from the build |
| A `<` in a summary breaks out of the script tag | The serialiser escapes `<` as `<` |
| The portrait's hashed address changes | It is read from `getImage` at build time, never written by hand |
| Search engines ignore it | Structured data is a hint, not a ranking guarantee; the story's aim is recognition and linking the profiles, and the test checks that it is read correctly |
| Lighthouse or the JavaScript budget | JSON-LD is inline data; the budget runs in CI |

## 4. Decisions

**✅ Decision 1 — What each page declares.** Confirmed 2026-10-07: `ProfilePage` with `Person` on the home
pages, `Article` on cases, nothing elsewhere.

**✅ Decision 2 — Properties and sources.** Confirmed 2026-10-07: the tables above, with the omissions
listed.

**✅ Decision 3 — The full name.** Confirmed 2026-10-07: A, `name` "Jesús Roncal" only.

**✅ Decision 4 — Build and check.** Confirmed 2026-10-07: a builder module with tests, `Base` props for
the data and `og:type`, and a post-build check.

**✅ Decision 5 — Verification.** Confirmed 2026-10-07: the Rich Results Test by Jesus on the published
home and one case; warnings for deliberate omissions recorded.
