# TOKEN ARCHITECTURE (v5) — Context as a Scarce, Engineered Resource

Premise: context is working memory, not storage. Bloated context doesn't
just cost money — it displaces instructions, dilutes attention, and raises
error rates. The doctrine: **disk is truth, conversation is scratchpad,
data bulk belongs to scripts.**

## 1. Memory Hierarchy

| Level | Contents | Residency |
|---|---|---|
| **L0 — Constitution** | CLAUDE.md (pointer doc), governing-doc precedence | always in context (auto-loaded) |
| **L1 — Hot state** | account_state.json, latest handoff block, today's halt/phase flags | loaded at session start, every session |
| **L2 — Session artifacts** | runs/{today}/ files | created and re-READ within the session (gates read files, not memory) |
| **L3 — Reference** | strategy docs, playbooks, templates | loaded section-on-demand, never wholesale; cite section numbers |
| **L4 — Archive** | runs/ older than 5 sessions, ledgers, equity curve, old journals | NEVER loaded wholesale; queried via scripts or targeted reads |
| **L5 — Distilled knowledge** | LESSONS_LEARNED.md, validation verdicts, calibration summaries | small by construction (distillation IS the compression); loaded weekly+ |

## 2. What Stays / Moves / Regenerates

- **Stays in active context**: today's regime + posture row, open positions
  + stops (from this session's reconcile), today's artifacts, the role card
  in use, current halt flags.
- **Moves to archive (by reference)**: everything in runs/ at session end;
  raw evidence blocks after their decision closes; tool dumps (never stored
  in artifacts at all — see §3).
- **Regenerated every time (never trusted from memory or yesterday)**:
  prices, indicator values, account balances, order states, the regime.
  Market data has a one-session shelf life, full stop.
- **Summarized once, then referenced**: weekly sector RS table, macro
  calendar (the memo is the cache; refresh per freshness rules).

## 3. Bulk-Data Rule (the biggest single saving)

The model never pages through bulk market data. Scripts consume bars/
ledgers/curves OUT of context and emit compact results:
`tools/regime.py` → 6 numbers + a code, not 250 bars in context.
`tools/metrics.py` → the metric pack, not the equity curve.
`tools/validate_flows.py` (quarterly) → verdict table, not the ledger.
Until those scripts exist (v3 P0 — still pending), bulk pulls are
permitted but must be: narrow (exact range needed), single-purpose, and
excerpted into the artifact as extracted numbers only. An artifact that
pastes raw tool output fails Compliance.

## 4. Session Handoff (compaction-proof continuity)

Every session ends by writing `state/HANDOFF.md` (~15 lines max, schema):
```
date/session-type · phase · regime+counter · equity/cash/heat ·
open positions (sym, shares, stop, day-count, next planned action) ·
pending items (verifications failed, cooldowns, watchlist-band names) ·
yesterday's invalidation triggers to check · open questions for next session
```
The next session boots from L0+L1+HANDOFF and must NOT need conversational
memory. Mid-session compaction recovery: if context was summarized, re-read
HANDOFF + today's runs/ directory and continue — gates fail closed on any
artifact the summary "remembers" but disk lacks.

## 5. Artifact Budgets (discipline targets, Compliance-sampled)

| Artifact | Budget |
|---|---|
| Intelligence report | ≤ 700 words + data tables |
| Conviction write-up (per name) | ≤ 300 words + component table |
| Bull/bear case | ≤ 250 words each (forced parity helps the debate too) |
| Trade plan | the template, filled — no essays |
| Session decision | ≤ 200 words |
| HANDOFF | ≤ 15 lines |
Budgets bind PROSE, not evidence tables. Over-budget = edit down; verbosity
is where unsupported claims hide.

## 6. Archive Strategy

git history is the archive mechanism (v3 P0 #1 — pending; until then,
filesystem only and this section is degraded). Nothing is deleted; old
runs/ compress naturally by never being loaded. Quarterly: distillation
pass — anything in archives worth keeping hot gets ONE line in L5 files
(that's the promotion path); everything else stays cold and queryable.
