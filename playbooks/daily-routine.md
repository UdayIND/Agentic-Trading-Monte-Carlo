# Daily Routine (v4) — the Decision Engine session
Run during market hours, ideally 10:00–11:30 ET. This playbook executes
`strategy/DECISION_ENGINE.md`; that document is authoritative on gate logic.
Artifacts → `runs/YYYY-MM-DD/`. Stages 0–2 are mandatory every session;
3–7 only when capacity and regime permit; 8 is mandatory; 9 as triggered.

## Stage 0 — Sync & guard
Read GOVERNANCE.md + state files. Halt flags / circuit breaker / hard floor /
cooldowns → maintenance-only session. Reconcile broker truth (portfolio,
positions, orders); every position has a live GTC stop or gets one NOW.
Update HWM (deposit-adjusted); check breaker anchor and 15% floor.

## Stage 1 — Market intelligence (before looking at any candidate)
Write `MARKET_INTELLIGENCE_REPORT.md` from the template: news, macro,
earnings, sector rotation, breadth proxies, volatility, sentiment, flows —
answering all six questions. Copy to `intelligence/LATEST.md`. No report →
no new entries today (position management still runs).

## Stage 2 — Position management (never gated)
v2 logic per position: stop fills → journal + post-mortem (Stage 9);
+2R partials; trail ratchets; time stops; earnings exits; core regime
rotation (max 1 core action/week). All exempt from tempo caps.

## Stage 3 — Opportunity ranking (if capacity exists)
Hard-disqualifier pre-filter → conviction-score up to 10 candidates →
write `TOP_OPPORTUNITIES.md` (template): full table, inclusion AND
exclusion reasons, watchlist band carryover, the rank-1-vs-rank-2 argument.
Best score < 80 → record the DO-NOTHING check and skip to Stage 8.

## Stage 4 — Decision challenge (rank-1 candidate only, max 2/day)
`BULL_CASE_[t].md` + `BEAR_CASE_[t].md` (comparable length), PM rebuttal if
needed, post-challenge re-score. Risk Manager worksheet + Compliance line.
Any gate fails or score < 80 → candidate dies; do NOT promote rank 2 the
same day unless it independently scored ≥ 80 pre-challenge.

## Stage 5 — Trade plan
`TRADE_PLAN_[t].md`, all eleven fields + invalidation conditions + heat
table. Copy lives in run dir; canonical in `trades/`.

## Stage 6 — Pre-execution verification (fresh data, at order time)
The seven checks, evidence inline, recorded in the plan file. Any failure →
status: cancelled(reason), log `verification_cancellations` += 1, move on.
Two failed attempts = plan dead permanently.

## Stage 7 — Execution
get_equity_tradability → review_equity_order → ticket match (>1% drift =
abort to Stage 6) → place (fresh ref_id) → fill quantity confirmed →
GTC stop placed for FILLED quantity → stop verified live → journal entry.

## Stage 8 — Session decision record (every session, even idle ones)
`DECISION.md`: BUY / SELL / HOLD / DO NOTHING + confidence % + reasoning +
risks + invalidation conditions + horizon. Append `state/decision_log.csv`.
Append `state/equity_curve.csv`. Update account_state (counts, dates,
conviction_watchlist, last_session_decision). One-message user report:
decision, equity, day P&L, heat, what was deliberately NOT done and why.

## Stage 9 — Post-trade intelligence (per closed trade)
`trades/POST_MORTEM_[t]_[date].md` (template: seven questions + grade
matrix + luck/skill split) → update `journal/LESSONS_LEARNED.md` (count
bumps; 3× → escalate flag for quarterly review).
