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

Phase 1.3:

| Canvas | Story | Depends on |
| ------ | ----- | ---------- |
| [010 — Ship without waiting](010-ship-without-waiting.md) | [010](../stories/010-ship-without-waiting.md) | 000, 004a, 009 |

Phase 1.4:

| Canvas | Story | Depends on |
| ------ | ----- | ---------- |
| [011 — Navigation always within reach](011-navigation-always-within-reach.md) | [011](../stories/011-navigation-always-within-reach.md) | 001, 004a, 007 |

Phase 1.5:

| Canvas | Story | Depends on |
| ------ | ----- | ---------- |
| [012 — A wrong address still lands](012-a-wrong-address-still-lands.md) | [012](../stories/012-a-wrong-address-still-lands.md) | 002, 004a, 009, 011 |

Phase 3:

| Canvas | Story | Depends on |
| ------ | ----- | ---------- |
| [004a — Spanish](004a-spanish.md) | [004](../stories/004-read-it-in-my-language.md), part a | 001, 002, 003, 008 |

Phase 4:

| Canvas | Story | Depends on |
| ------ | ----- | ---------- |
| [009 — Know what works](009-know-what-works.md) | [009](../stories/009-know-what-works.md) | 002, 003, 004a, 008 |

Cross-cutting rules every canvas inherits are in [norms.md](norms.md). Figma node IDs (000–006) and
Penpot frame names (004a, 007, 008) refer to the files listed in [../design.md](../design.md).
