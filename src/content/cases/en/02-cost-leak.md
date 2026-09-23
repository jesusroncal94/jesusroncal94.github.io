---
order: 2
roleId: mindfortress-inc
organisation: MindFortress
role: Tech Lead
title: Finding the AI spend nobody could explain
summary: A spend bucket with no owner was burning $12–16 a day. I traced it to its source, shipped a guard so it cannot recur, and verified $0 in the production ledger.
before: $15/day
after: $0
stack: [Python, Railway, Cost ledger]
keywords: [cost, spend, leak, money, ledger, production, debugging]
---

## Problem

As Technical Lead at MindFortress I ran production operations for two AI products, including
the cost ledger for their AI spend. One bucket in that ledger had no owner: a chronic
$12–16 a day that no feature accounted for.

A leak that size is easy to live with. It is also a sign that something in production is
doing work nobody asked for — and whatever that is, it will not stay small on its own.

## Approach

I treated it as a bug with a number attached. Instead of guessing where the money might be
going, I followed the unattributed spend back until it led to its source: a stale background
worker that should not have been making those calls at all.

Stopping it once would not have been a fix, because the conditions that started it could
return. So I shipped a guard in the code to keep the same situation from happening again,
and then checked the result where it matters — in the production ledger, not in the code.

## Result

The unattributed spend went from about $12–16 a day to $0, verified in the production
ledger rather than assumed.

The guard turns a quiet, recurring cost into a failure that would show up immediately. The
broader habit is the one I apply to any AI system I run: spend is a metric like latency, and
a number nobody can explain is an incident waiting to be named.
