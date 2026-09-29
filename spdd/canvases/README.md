# REASONS canvases

Step 4 of the SPDD flow. Each canvas is the executable blueprint for one story:
**R**equirements, **E**ntities, **A**pproach, **S**tructure, **O**perations, **N**orms,
**S**afeguards. Code is generated from a canvas one operation at a time. When the code
changes, the canvas is synced back so the two never drift.

Build order for Phase 1:

| Canvas | Story | Depends on |
| ------ | ----- | ---------- |
| [000 — Foundation](000-foundation.md) | enables all | — |
| [006 — Public profile export](006-public-profile-export.md) | [006](../stories/006-public-profile-export.md) | 000 |
| [001 — Twenty-second scan](001-twenty-second-scan.md) | [001](../stories/001-twenty-second-scan.md) | 000, 006 |
| [002 — Case study deep dive](002-case-study-deep-dive.md) | [002](../stories/002-case-study-deep-dive.md) | 001 |
| [003 — Get in touch](003-get-in-touch.md) | [003](../stories/003-get-in-touch.md) | 001, 006 |

Phase 1.1:

| Canvas | Story | Depends on |
| ------ | ----- | ---------- |
| [007 — Reads well on any screen](007-reads-well-on-any-screen.md) | [007](../stories/007-reads-well-on-any-screen.md) | 001, 002, 003 |

Phase 1.2:

| Canvas | Story | Depends on |
| ------ | ----- | ---------- |
| [008 — Link preview](008-link-preview.md) | [008](../stories/008-link-preview.md) | 001, 002, 003 |

Cross-cutting rules every canvas inherits are in [norms.md](norms.md). Figma node IDs (000–006) and
Penpot frame names (007–008) refer to the files listed in [../design.md](../design.md).
