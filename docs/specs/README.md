# Specs

This project's specs are its SPDD artefacts, not files in this folder. A spec is a story plus its
REASONS canvas:

| The standard's term | Here |
|---|---|
| Spec: why, behaviour, acceptance | A story in [`spdd/stories/`](../../spdd/stories/): persona, WHEN/THEN acceptance criteria, definition of done |
| Design and decisions | Penpot frames ([`spdd/design.md`](../../spdd/design.md)) and an analysis in [`spdd/analysis/`](../../spdd/analysis/) with dated decisions |
| Implementation plan | A canvas in [`spdd/canvases/`](../../spdd/canvases/), built one operation at a time |
| What really ran | The canvas `## Sync — YYYY-MM-DD` section, authoritative where it differs from the operations |
| Acceptance entries | [`acceptance/features.json`](../../acceptance/features.json), one entry per story (`S-NNN`), pointing at the story's criteria rather than copying them |
| Spec approval | Jesus's yes on the story texts and the mockups, then on the start of the canvas |

Write a new spec as a story first; the `spec` skill's sizing still applies (no story for a one-line
fix, but the fix is synced into the canvas it touches). [`_template.md`](_template.md) comes from the
standard and is kept so template updates apply cleanly; it is not used here.
