# 006 — Public profile export

Story: [006](../stories/006-public-profile-export.md). No Figma node: this is data plumbing.

**Status:** implemented and synced with the code on 2026-09-23.

## R — Requirements

Turn `cv-manager/profile.md` into `data/public-profile.json`, keeping only allow-listed
facts, so the site and the CV PDF never contradict the private source and nothing private
leaks.

**Done when:** `./tasks.ps1 export` writes the JSON from the real profile; the output
validates against the schema; the privacy test passes; the file is committed and the build
reads it without access to `cv-manager`.

## E — Entities

```ts
PublicProfile {
  name: string                    // "Jesus Enrique Roncal Huatta"
  headline: string                // "Senior Software Engineer | AI & Backend"
  city: string                    // "Milan, Italy" — any parenthetical removed
  contact: { email: string; linkedin: URL; github: URL }
  roles: Role[]                   // newest first, as in the profile
  education: { degree: string; institution: string; year: number }[]
  skills: { group: string; items: string[] }[]
  languages: { name: string; level: string }[]
}

Role {
  id: string                      // slug of the organisation: "mindfortress-inc"
  title: string                   // "Technical Lead - AI Products"
  organisation: string            // "MindFortress Inc (via Revelo)"
  location: string | null         // "USA - Remote"
  start: string                   // "2025-10" or "2021"
  end: string | null              // null when "present"
}
```

Role bullets and technologies are **not** exported: the site's one-liners are editorial and
already approved, and bullets hold detail the confidentiality check softened.

## A — Approach

A pure parser plus a thin command. The parser strips HTML comments, splits the document by
`##`/`###` headings, and reads each allowed section with a dedicated function. Everything
not asked for is ignored by construction — an allow-list, not a deny-list. The result is
validated with a Zod schema and written with stable key order, so the committed diff shows
only real changes.

Role headings follow `### <title> — <organisation>[, <location>] (<start> to <end>)`. The
organisation and location split at the **first** comma after the em dash, which handles
every role in the current profile (including `Red Cientifica Peruana, Lima, Peru` and the
comma-free `Indra (Peru) | Pretty Technical (Netherlands)`).

## S — Structure

```
src/lib/profile/schema.ts       Zod schema and inferred types
src/lib/profile/parse.ts        pure parsing functions
scripts/export-profile.ts       reads, parses, validates, writes
tests/fixtures/profile.md       trimmed profile with deliberate private lines
tests/profile.test.ts
data/public-profile.json        generated, committed
compose.yaml                    + service `export`
```

## O — Operations

1. **`schema.ts`**: `publicProfileSchema` matching the entities, with `.strict()` objects so
   an unexpected key fails validation; export `type PublicProfile` and `type Role`.
2. **`parse.ts`**:
   - `stripComments(markdown: string): string` removes `<!-- … -->`, including multi-line ones.
   - `section(markdown: string, path: string[]): string` returns everything under a heading
     path, subsections included, e.g. `['Profile', 'Experience']` or
     `['Profile', 'Skills', 'Languages']`, and throws when the path is missing. This replaced
     a flat `splitSections` map during implementation: role parsing needs the Experience
     section with its `###` children, which a map of leaf sections loses.
   - `parseContact(section: string)` reads the `Email`, `LinkedIn`, `GitHub` and `Location`
     bullets; the location loses any `( … )`.
   - `parseRoles(section: string): Role[]` matches each `###` heading with
     `/^(.+?) — (.+?) \((\d{4}(?:-\d{2})?) to (\d{4}(?:-\d{2})?|present)\)$/`.
   - `parseEducation` (`<degree> — <institution> — <year>`), `parseSkills` (the
     `- <Group>: a, b, c` bullets under `### Technical`, split on commas and semicolons
     outside parentheses so `AWS (ECS, EC2, …)` stays one item), `parseLanguages` (the
     `- <Name> — <Level>` bullets).
   - The role `id` is the organisation slug with any parenthetical removed:
     `MindFortress Inc (via Revelo)` → `mindfortress-inc`.
   - `parseProfile(markdown: string): PublicProfile` composes them and returns the
     schema-validated object.
3. **`scripts/export-profile.ts`**: reads `process.env.PROFILE_PATH ?? '/cv-manager/profile.md'`,
   calls `parseProfile`, writes `data/public-profile.json` with two-space indent and a
   trailing newline, and prints the role count.
4. **`package.json`** gains `"export": "tsx scripts/export-profile.ts"`. **`compose.yaml`**:
   service `export` mounts `../cv-manager` read-only at `/cv-manager` and runs
   `npm run export`. **`tasks.ps1`** gains `export`.
5. **Fixture**: `tests/fixtures/profile.md` with the Summary, Contact (including the
   WhatsApp line), two roles (one ending `present`, one with a comma-free organisation), the
   skills, the languages, a `## Preferences` section with a salary line, and an HTML comment.
6. **`tests/profile.test.ts`**:
   - parses the fixture into the expected `PublicProfile` (happy path);
   - **privacy guard:** the serialised output contains no phone-number pattern
     (`/\+\d[\d\s]{7,}/`), no currency amount (`/\d[\d,.]*\s*(USD|EUR)|\$\s*\d/`), and none
     of `salary`, `sponsorship`, `deal-breaker`, `WhatsApp`. The same three patterns match
     the raw fixture, which shows the guard would catch a leak.
7. Run the export against the real profile and commit `data/public-profile.json`. Result
   on 2026-09-23: 7 roles, 1 degree, 8 skill groups, 3 languages; a scan of the file for
   phone, currency, visa and comment patterns found nothing.

## N — Norms

All of [norms.md](norms.md). The parser is side-effect free; only the script touches the
filesystem.

## S — Safeguards

- `cv-manager` is mounted read-only and never copied, vendored or referenced by path in
  committed code other than the compose mount.
- If a heading no longer matches, the export fails with the offending heading in the
  message. It never writes a partial file.
- The committed JSON is reviewed in the diff before every push, like code.
