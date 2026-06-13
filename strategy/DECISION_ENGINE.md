# DECISION ENGINE (v4) — Continuous Market Intelligence & Decision Support

This document defines how every trading session runs. It does not add alpha;
it ensures every action taken is demonstrably better than doing nothing.
Binding via GOVERNANCE.md Article IX. Precedence: GOVERNANCE > RISK_FRAMEWORK
> STRATEGY_v2 > this engine > templates.

## Prime Directive — Priority Order (constitutional)

1. **Avoid catastrophic loss** (hard floor, exposure caps, no leverage)
2. **Preserve capital** (cash is the default position, not a residual)
3. **Beat QQQ on a risk-adjusted basis** (Sharpe/MaxDD, not raw return)
4. **Generate returns**

A decision that serves a lower priority at the expense of a higher one is
wrong by definition, regardless of outcome. Extended periods (weeks, months)
of holding cash are an expected, successful operating mode.

---

## The Session Pipeline (every market-touching session, in order)

Artifacts live in `runs/YYYY-MM-DD/`. **Each stage reads its inputs from the
files written by prior stages — a missing artifact fails the gate closed**
(no artifact = that stage never happened, whatever the session "remembers").

### Stage 0 — Sync & Guard (unchanged from v2)
State load, broker reconciliation, stop-integrity check, halt-flag check.
Any failure → session is maintenance-only.

### Stage 1 — Market Intelligence (`MARKET_INTELLIGENCE_REPORT.md`)
Produced BEFORE any position or candidate analysis, per the template in
`intelligence/TEMPLATE_MARKET_INTELLIGENCE_REPORT.md`. Covers: market news,
macro developments, earnings landscape, sector rotation, breadth,
volatility conditions, sentiment, institutional flows (when observable).
Must ANSWER the six questions (what / why / what changed / what matters /
ignored risks / invalidation) — synthesis, not headlines. Sourcing rules
per RESEARCH_PROCESS §5 (named sources, injection hygiene).
**No intelligence report this session = no new entries this session.**

### Stage 2 — Position Management (before any new idea)
Existing v2 logic: stops, partials, trails, time stops, earnings exits,
regime rotation. Position management is never blocked by Stages 3–7 —
risk-reducing actions always run.

### Stage 3 — Opportunity Ranking (`TOP_OPPORTUNITIES.md`)
Score EVERY watchlist candidate with the Conviction Framework
(`CONVICTION_FRAMEWORK.md`), rank, and write the daily table: score,
expected reward, risk, holding period, sector, catalyst, inclusion AND
exclusion reasons. The chosen candidate (if any) must be explicitly argued
superior to the next-best alternative — "best available" is a comparative
claim and requires the comparison in writing.

### Stage 4 — Decision Challenge (`BULL_CASE_[ticker].md`, `BEAR_CASE_[ticker].md`)
Two separate files, comparable length. The bear case is written to KILL the
trade: invalidation paths, crowding, what the bull case conveniently
ignores, why the score might be inflated. Survival test (the v2 debate
rules apply): factual rule violation found → dead; strong qualitative bear
→ PM must rebut in writing, point by point. Then Risk Manager gate (heat
worksheet) and Compliance check, as in AGENT_ARCHITECTURE. A trade proceeds
only if: bull survives + Risk approves + Compliance approves + conviction
still ≥ 80 after the challenge (re-score if the bear case landed hits).

### Stage 5 — Trade Plan (`TRADE_PLAN_[ticker].md`)
Per the template — all eleven fields (entry, initial stop, T1, T2, final
exit logic, holding period, size, risk $, max loss, expected reward,
expected R) plus invalidation conditions. **No plan file = no order.** The
plan is written BEFORE the verification stage so verification has a fixed
object to verify.

### Stage 5b — Quality Gate (v5: QUALITY_CHECK_REPORT.md)
After PM approval, before verification: the six checks of
`platform/QUALITY_GATE_SYSTEM.md` (missing evidence, unsupported claims,
contradictions, staleness, rule violations, calculation errors) run by a
non-producer pass. Any failure blocks the recommendation (one revision
permitted, then dead). Applies to trades AND to the session decision draft.
Order-path work follows the three-pass protocol
(`platform/AGENT_REASONING_PROTOCOL.md`): primary → fresh-context critic →
final; no role approves its own work.

### Stage 6 — Pre-Execution Verification (final checklist, at order time)
Re-pull fresh data, then answer ALL seven, each with evidence:
1. Still the best opportunity available (vs today's TOP_OPPORTUNITIES)?
2. Has news changed since the intelligence report?
3. Has volatility changed (ATR/quote vs plan assumptions)?
4. Has the market regime changed (or a change pending confirmation)?
5. Has earnings risk changed (date moved/announced)?
6. Is position sizing still correct at the live price?
7. Is the reward still worth the risk (R:R recomputed at live prices)?

**Any single failure cancels the trade.** Cancellations are logged with the
failing item — a cancelled trade at this stage is the system working.

### Stage 7 — Execution (unchanged v2 mechanics)
review → place (fresh ref_id) → fill check → protective stop → verify stop
→ journal. Zero discretion.

### Stage 8 — Session Decision Record (mandatory, every session)
Every session ends with exactly one headline decision:

> **BUY** (entered/added) · **SELL** (reduced/exited) · **HOLD** (maintaining
> positions, no changes) · **DO NOTHING** (flat or no action — the default)

Recorded in `runs/YYYY-MM-DD/DECISION.md` and appended to
`state/decision_log.csv`, containing ALL of:
- **Decision** + tickers affected (if any)
- **Confidence %** — calibrated: 55% = barely better than coin-flip,
  90%+ = reserved for near-mechanical decisions (e.g., stop honored)
- **Reasoning** — 3–6 sentences a stranger could follow months later
- **Risks** — what hurts this decision
- **Invalidation conditions** — observable, specific ("QQQ closes below
  X", "stop at Y", "earnings moved inside 10 days"), not vibes
- **Expected time horizon**

If multiple actions occurred, the record lists all; the headline is the
most consequential. DO NOTHING records require the same rigor — *why* was
inaction superior to the best-scored candidate today?

### Stage 9 — Post-Trade Intelligence (on every CLOSED trade)
`POST_MORTEM_[ticker]_[YYYY-MM-DD].md` per template: thesis correct?
execution correct? risk management correct? signals that worked/failed?
luck vs skill (be specific — a win on a thesis that was wrong is luck and
gets recorded as luck). Then update `journal/LESSONS_LEARNED.md`: only
genuinely new lessons enter; recurring lessons get a count bump, and any
lesson recurring 3× becomes a mandatory agenda item at the next quarterly
review (a lesson learned three times is a rule that wants to exist).

---

## Audit Trail Specification

The standard (unchanged from the v2 audit): *a third party could reconstruct
exactly why every decision was made, months later, from the repo alone.*

| Record | Where | When |
|---|---|---|
| Market intelligence | `runs/<date>/MARKET_INTELLIGENCE_REPORT.md` (+ copy of latest at `intelligence/LATEST.md`) | every session |
| Candidate ranking | `runs/<date>/TOP_OPPORTUNITIES.md` | every session w/ scan |
| Conviction scores + written justification | inside TOP_OPPORTUNITIES + trade plan | every scored name |
| Bull/Bear cases, risk worksheet, compliance line | `runs/<date>/` | every nomination |
| Trade plan | `runs/<date>/TRADE_PLAN_<t>.md` (copied to `trades/`) | before any order |
| Verification checklist result | `runs/<date>/VERIFICATION_<t>.md` | at order time |
| Execution record (ref_ids, fills, stop confirmation) | journal entry + run log | on execution |
| Session decision | `runs/<date>/DECISION.md` + `state/decision_log.csv` | EVERY session, no exceptions |
| Post-mortem | `trades/POST_MORTEM_<t>_<date>.md` | every closed trade |
| Lessons | `journal/LESSONS_LEARNED.md` | continuously |

`state/decision_log.csv` columns:
`date,time_et,regime,decision,tickers,conviction,confidence_pct,heat_after,cash_pct,run_dir`

## Session Close (v5 addition)
Every session ends by writing `state/HANDOFF.md` (TOKEN_ARCHITECTURE §4 —
≤ 15 lines). The next session boots from CLAUDE.md + account_state.json +
HANDOFF.md and must need NO conversational memory. Disk is truth;
conversation is scratchpad.

## Tempo & Cost Controls (anti-bureaucracy)

The engine must not become a reason to overtrade *analysis*. Caps: full
conviction scoring for at most 10 candidates/day (pre-filter the rest with
the hard disqualifiers); ONE intelligence report per session (no intraday
re-issues unless a halt-grade event occurs); the verification stage may run
at most twice for one plan (a plan failing verification twice is dead, not
pending). All v2 trade-tempo caps unchanged.
