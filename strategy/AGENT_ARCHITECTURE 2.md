# AGENT ARCHITECTURE — Roles, Vetoes, and the Consensus Pipeline

## Implementation note (honest)

In this deployment the seven "agents" are **structured sequential role
passes executed by Claude within a single session**, each producing a written
artifact before the next begins. The discipline comes from the artifacts and
veto gates, not from separate processes. When run inside Claude Code, the
analyst roles MAY be spawned as real subagents for independence (the Risk
Manager and Compliance Auditor especially benefit from not sharing the
analyst's context); the contract below is identical either way. A role may
never "skip ahead" — each gate requires the prior artifact to exist.

## Pipeline

```
Regime Analyst ──► Macro Analyst ──► Technical Analyst ──► DEBATE (bull vs bear)
                                                                │
                              Risk Manager (VETO gate) ◄────────┘
                                       │ pass
                              Portfolio Manager (approve/size/rank)
                                       │ approve
                              Execution Agent (mechanical only)
                                       │ fills
                              Compliance Auditor (post-trade + continuous)
```

A trade reaches the market only if: no veto fired, PM approved, and
execution checks passed. **Default outcome is NO TRADE.** Silence or
ambiguity at any gate = rejection.

---

## Role Cards

### 1. Market Regime Analyst
- **Inputs**: QQQ/SPY daily bars (1yr), prior regime state from
  `state/account_state.json`.
- **Outputs**: regime classification (STRATEGY_v2 §1) with the numbers shown
  (close, 200d SMA, 50d SMA slope, 20d RV percentile), hysteresis status,
  active posture row.
- **Powers**: gates which playbooks are active. Its output is binding on all
  downstream roles; nobody may trade a playbook the regime disables.
- **Forbidden**: opinions about individual names.

### 2. Macro Analyst
- **Inputs**: WebSearch for the macro calendar (FOMC, CPI, NFP, major
  geopolitical/market-moving events) for the next 5 sessions; earnings dates
  for any candidate or held name.
- **Outputs**: event-risk memo — list of dated events with a
  trade/don't-trade flag per day; earnings flags per ticker.
- **Powers**: soft veto — can mark days "no new entries" (Layer-4 soft
  limits). Hard veto on any entry violating the 10-day earnings rule.
- **Forbidden**: forecasting outcomes of events. The job is calendar risk,
  not prediction. Every claim must carry a source; unverifiable claims are
  discarded by the Compliance Auditor.

### 3. Technical Analyst
- **Inputs**: watchlist quotes + historicals, sector RS table (weekly),
  active playbooks from the Regime Analyst.
- **Outputs**: ranked candidate list with opportunity scores
  (RESEARCH_PROCESS §4), each with playbook, trigger evidence (actual
  numbers: SMA values, ATR, RS, volume ratio), proposed entry/stop/target.
- **Powers**: none beyond nomination. Maximum 2 nominations per day.
- **Forbidden**: nominating anything scoring < 70, or fabricating an
  indicator value not computed from fetched bars.

### 4. The Debate (bull vs bear pass)
For each nomination, two written cases of equal length:
- **Bull case**: why this works — trend, RS, setup, catalyst proximity.
- **Bear case**: written as if by a skeptic paid to kill the trade — what
  invalidates it, crowding, extension, sector fragility, base quality flaws.
- **Resolution rule**: if the bear case identifies a factual rule violation
  → dead. If it is merely qualitatively strong, the nomination survives but
  the PM must address the bear case explicitly in writing when approving.
  No address = no approval.

### 5. Risk Manager — ABSOLUTE VETO
- **Inputs**: nomination + debate, live portfolio (`get_portfolio`,
  `get_equity_positions`, open orders), `state/account_state.json`.
- **Outputs**: the heat worksheet (RISK_FRAMEWORK) filled in with real
  numbers, per-layer pass/fail, final size.
- **Powers**: absolute, unappealable veto on any order. Can also order
  defensive exits when Layer-2 limits are hit. The Risk Manager evaluates
  ONLY rule compliance — it does not weigh the bull case; conviction is
  inadmissible evidence at this gate.
- **Forbidden**: approving a trade "with adjustments" that weren't re-run
  through the worksheet.

### 6. Portfolio Manager
- **Inputs**: risk-passed candidates, current book, regime posture, recent
  performance (loss streak, heat utilization).
- **Outputs**: approve/reject per candidate with the bear case addressed;
  priority order when more candidates pass than slots exist; core-sleeve
  rebalance decisions.
- **Powers**: final business judgment — may reject risk-passed trades for
  portfolio fit (correlation crowding, better candidate waiting, "the book
  doesn't need this"). May NOT resurrect a risk-vetoed trade or exceed a
  size from the worksheet.
- **Bias instruction**: when in doubt, the answer is no. Opportunity cost
  is recoverable; capital is less so.

### 7. Execution Agent
- **Inputs**: approved order ticket (symbol, side, type, size, limit, stop).
- **Procedure**: `get_equity_tradability` → `review_equity_order` → check
  review output against the ticket (price drift > 0.5% from ticket = back to
  PM) → `place_equity_order` with fresh UUID `ref_id` → confirm fill state →
  place GTC protective stop → verify stop is live → journal.
- **Powers**: none. Zero discretion. May not alter size, price, or symbol.
  Any anomaly (rejection, partial fill, halt) = halt sequence, report.
- **Idempotency**: same `ref_id` on transport retries; never re-place after
  an ambiguous outcome without checking `get_equity_orders` first.

### 8. Compliance Auditor
- **Inputs**: everything — the full run transcript, orders, state file,
  journal.
- **Outputs**: per-run audit line in the journal (rules checked, violations,
  near-misses); maintains the violation log; weekly adherence section.
- **Powers**: can trip the circuit breaker on: any hard-limit breach, any
  evidence of fabricated data in an upstream artifact, any unexplained
  order/state discrepancy, or 3 soft-limit near-misses in 5 sessions. Can
  freeze trading pending user review.
- **Independence**: audits the process, not the P&L. A profitable violation
  is still a violation and is recorded as one.

## Consensus & Deadlock Rules

1. Unanimity is not required; **absence of veto + PM approval** is.
2. Any role finding data integrity problems (stale quotes, missing bars,
   tool errors) suspends the pipeline for that run.
3. Disagreement between artifacts (e.g., Macro says "no-entry day", PM wants
   in) resolves in the RESTRICTIVE direction, always.
4. The user may override any gate explicitly and in writing; the Compliance
   Auditor records the override and the dissent (GOVERNANCE Art. VII).
