# OPERATIONAL READINESS — Pre-Launch Checklist & Runbooks
**Date**: 2026-06-12 · **Status**: ❌ NOT READY FOR LIVE CAPITAL (7 blocking items). Paper trading may proceed today.

---

## 1. Pre-Launch Checklist

### Blocking (must be ✅ before the first live order)
- [ ] **B1. Version control**: `git init`; every run ends with a commit
  (`run: YYYY-MM-DD daily|weekly|trade SYMBOL`); remote (private GitHub or
  equivalent) configured; push at least weekly. Without this there is no
  tamper evidence, no recovery, and no audit trail integrity.
- [ ] **B2. Breaker completion adopted**: re-arm rule + 15% hard floor
  (GOVERNANCE_HARDENING §2) approved by user and merged into the docs.
- [ ] **B3. Guard script live**: `tools/guard.py` deterministic pre-trade
  validator (spec in §5) passing its own test suite; constitution amended so
  no order is placed without a guard PASS.
- [ ] **B4. Deposit-adjusted accounting**: `state/flows.csv` exists; HWM,
  drawdown, and returns defined as time-weighted / flow-adjusted; "equity"
  pinned to `get_portfolio.total_value` minus pending deposits.
- [ ] **B5. Concurrency lock**: run-lock convention (state field
  `run_in_progress` with timestamp + takeover rule after 2h) so two sessions
  cannot trade simultaneously.
- [ ] **B6. Paper gate passed**: 8 weeks / 20 signals, expectancy ≥ +0.1R,
  zero hard violations, ≤8% paper DD (IMPLEMENTATION_ROADMAP §3).
- [ ] **B7. Deposit landed and verified**: $1,000 settled in account
  825795594, confirmed via get_portfolio, recorded in flows.csv.

### Required (first 2 weeks of live)
- [ ] R1. Tempo-cap unification + risk-reducing-order exemption merged (audit C4).
- [ ] R2. Metrics script (`tools/metrics.py`) computing the PERFORMANCE_EVALUATION
  pack from equity_curve.csv + journal frontmatter.
- [ ] R3. Journal frontmatter made machine-readable (YAML header: symbol,
  entry, stop, shares, risk_pct, exit, realized_R, process_grade).
- [ ] R4. User notification path verified for: breaker trip, hard floor,
  failed run, reconciliation mismatch.
- [ ] R5. Definitions appendix merged (ATR/RSI formulas, session, timezone,
  equity — audit §3 list).

## 2. Data Requirements

| Need | Source | Validation before use |
|---|---|---|
| Live quotes | get_equity_quotes | timestamp < 15 min in-session; state=active; bid/ask nonzero |
| Daily bars (≥ 1y for regime, ≥ 200 bars per name) | get_equity_historicals | bar count sufficient; last bar date = last session; **sanity: today's quote within 10% of last close, else halt and flag (split/adjustment fault)** |
| Positions/orders/cash | get_equity_positions / orders / portfolio | reconciles with state file (§3) |
| Earnings & macro calendar | WebSearch (named sources only) | two sources for any date that gates a trade |
| Risk-free rate | WebSearch, quarterly | recorded in state with source + date |

## 3. State Validation (every run, before any decision)

1. Schema check `account_state.json` (all required keys, types, ranges —
   e.g. `0 ≤ risk_per_trade_pct ≤ 0.015`).
2. **Reconcile broker → state**: positions match `open_satellites` + core;
   every position has a live GTC stop; cash & equity within $1 of recorded.
3. Derived-value audit: HWM ≥ current equity (flow-adjusted); counts
   non-negative; dates not in the future.
4. Any mismatch → trading halted this run; rebuild per §4.2; mismatch logged.

## 4. Backup & Recovery Procedures

**4.1 Backup**: git commit per run (B1) = full versioned backup of state,
journal, docs. Remote push = off-machine copy. The broker holds the
authoritative copy of positions/orders/fills independently of us. Quarterly:
verify the remote actually contains the latest history (trust, then verify).

**4.2 State rebuild (corruption/loss)**: trading halted → pull
get_equity_positions + get_equity_orders (90 days) + get_portfolio →
reconstruct positions/stops/counts from broker truth → reconstruct HWM and
equity curve from git-history equity_curve.csv + flows.csv → diff rebuilt
vs corrupted state in the journal → user ack → resume next session.

**4.3 Disaster recovery (machine loss)**: clone repo from remote on any
machine with Claude Code + the Robinhood MCP → state validation (§3) →
positions remain stop-protected at the broker throughout (this is why
exchange-side stops are constitutional). Target recovery time: < 1 session.
**Drill**: once per quarter, perform a clean-clone dry run; a backup that
has never been restored is a hypothesis, not a backup.

**4.4 Mid-run failure** (session dies between entry fill and stop
placement — the worst window): every run begins by checking for positions
without stops (already in daily routine step 2) and for `run_in_progress`
locks older than 2h → complete the unfinished protection FIRST. The entry
sequence writes `pending_stop: SYMBOL` to state before placing the entry
and clears it after the stop is verified — so the gap is always discoverable.

## 5. Guard Script Specification (`tools/guard.py` — B3)

Deterministic, no-LLM validator run before every order. Input: proposed
ticket JSON + account_state.json + fresh tool outputs (quotes, positions,
open orders, bars). Checks, all hard-fail:
account is 825795594 · instrument on the permitted list (long stock/ETF) ·
sizing formula recomputed from bars (ATR14 by stated formula) matches ticket
shares ± 1 share · risk ≤ regime max · notional ≤ 30% · post-trade heat ≤
regime cap · bucket/correlation caps · cash floor honored post-trade ·
settled funds sufficient · no open order same symbol/side (duplicate guard)
· no same-day round trip · tempo caps (with risk-reducing exemption) ·
earnings distance ≥ 10 days (date supplied in ticket, source recorded) ·
quote fresh & sane vs last bar · stop order accompanies every entry ticket ·
limit within slippage budget. Output: PASS or the exact failed rule. The
Risk Manager role *interprets*; the guard *enforces*. Disagreement = no trade.

## 6. Logging & Audit Trail Requirements

Every run MUST persist (git-committed): run header (date, type, model
version, phase, regime in/out) · every tool call's key outputs used in
decisions (quotes/indicator values, in the run log or journal) · pipeline
artifacts per gate (regime memo, macro memo, nominations + scores, debate,
risk worksheet, PM decision, guard output, execution record) · all orders
with ref_ids and fill states · state diff (before/after) · Compliance audit
line · equity_curve.csv append (paper runs append with `phase=paper` tag).
Retention: indefinite (it's text; storage is free; track records are not).
The standard: **a stranger could reconstruct every decision from the repo
alone.** If they can't, logging has failed.
