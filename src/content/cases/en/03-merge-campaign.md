---
order: 3
roleId: mindfortress-inc
organisation: MindFortress
product: Reeve
role: Tech Lead
title: 112 PRs to production in 30 hours
summary: Parallel Claude Code agents in isolated worktrees rebased and stacked the queue across 4 repos; a serial no-new-failures gate decided what merged.
before: 112 queued
after: '0'
stack: [Claude Code, GitHub Actions, pytest]
keywords: [agents, claude code, merge, pull requests, ci, release, reeve]
---

## Problem

Reeve is an AI commerce-growth platform, and its MVP was waiting on a queue of 112 pull
requests across 4 repositories. I owned code review and release gating, so clearing that
queue was my job — without letting speed lower the bar for what reaches production.

A queue that size fights itself. Every merge moves the base under the pull requests behind
it, and CI needed work of its own before a green build could be trusted.

## Approach

I split the work in two: parallel preparation, serial admission.

Preparation ran in parallel. Claude Code agents each worked in an isolated git worktree, so
they never stepped on each other. They rebased pull requests by content and assembled
dependent changes into stacked chains that could land in order.

Admission stayed serial. Every pull request passed a no-new-failures gate before it merged:
the test suite could not end up worse than it was before the merge. Along the way I
unblocked CI itself, sharding the suite and fixing tests that depended on their environment,
so that a red build meant a real problem.

## Result

All 112 pull requests went from the queue to production in about 30 hours. The agents
supplied the throughput; the serial gate supplied the safety.

It is the same division of labour I use for release gating day to day — 6–8 pull requests
per session to production, each through empirical pre-merge gates: tests, type checks and
migration replays.
