# IMPLEMENTATION ROADMAP — Validation, Deployment Phases, and Scaling

## 1. Backtesting Every Rule (with the tools we actually have)

Method: point-in-time replay on daily bars from `get_equity_historicals`
(split-adjusted, multi-year ranges available). Worked in a scratch notebook
or script under `backtests/`, one file per rule tested.

**Protocol:**
1. **Point-in-time discipline**: decisions at bar *t* use only bars ≤ *t*;
   execution happens at bar *t+1*'s open ± slippage. Never use a bar's own
   close to trigger and fill at that same close.
2. **Costs**: $0 commission, but model slippage at 0.1% per side (small
   marketable limits in liquid names) and skip-fills when the open gaps past
   the limit budget — exactly mirroring the live 0.5%/2% rules.
3. **Regime coverage**: every rule must be replayed across ≥ 2 distinct
   regimes (e.g., a trending year AND a choppy/down year). A rule tested
   only in a bull market is untested.
4. **Survivorship honesty**: today's watchlist is survivorship-biased by
   construction (we picked recent winners). Counter it by also replaying on
   a fixed mechanical universe (the 11 sector ETFs + SPY/QQQ/SMH/XBI/RSP),
   which has no selection bias. Stock-level replay results are labeled
   "biased-sample, directional evidence only."
5. **What to measure**: per-rule expectancy (R), win rate, max consecutive
   losses, max drawdown contribution, and — critically — how results change
   when each parameter is perturbed ±25% (see overfitting).

## 2. Walk-Forward Procedure

Parameters here are fixed a priori from well-known robust ranges, not
optimized. If any parameter is ever tuned, walk-forward is mandatory:

1. Split history into rolling windows: 12 months in-sample, the following
   6 months out-of-sample; roll forward 6 months; ≥ 3 folds.
2. Tune ONLY on in-sample; freeze; measure out-of-sample.
3. Accept a parameter change only if out-of-sample expectancy is positive
   in a majority of folds AND the out-of-sample/in-sample performance ratio
   ≥ 0.5 (less than half the in-sample edge surviving = curve-fit).
4. Quarterly live walk-forward (RESEARCH_PROCESS §3): replay the past
   quarter with rules-as-written and reconcile with trades-as-taken.

## 3. Paper-Trading Gate (before live, and after any stop-trading event)

- Duration: minimum **8 weeks or 20 completed signals**, whichever is later.
- Paper trades run the FULL pipeline (all role passes, journal, state) with
  `review_equity_order` as the execution endpoint (review-only = perfect
  paper fills with real pre-trade alerts), never `place_equity_order`.
- Pass criteria: expectancy ≥ +0.1R, zero hard-limit violations, max
  paper drawdown ≤ 8%, and every journal entry complete.
- While the account holds $0 (current status), the system is in this phase
  by default.

## 4. Overfitting — Sources and Countermeasures

| Source | Countermeasure |
|---|---|
| Parameter mining (testing 50 variants, keeping the best) | Parameters fixed a priori; max 2 changes/quarter; every tested-and-rejected variant logged in CHANGELOG so the search itself is visible |
| Look-ahead bias | t/t+1 execution protocol; no same-bar trigger-and-fill |
| Survivorship bias | fixed ETF universe as the unbiased control |
| Regime-specific fit | mandatory ≥ 2-regime replay; per-regime expectancy reported |
| Small samples | n ≥ 20 before any conclusion; confidence stated in trades, not adjectives |
| Fragile parameters | ±25% perturbation test — a real edge survives 1.5×ATR vs 2×ATR; a curve-fit dies |
| Backtest-to-live gap | paper gate measures the gap explicitly before money moves |

## 5. Scaling Plan

The constant across all tiers: risk-per-trade percentage and heat caps NEVER
scale up with confidence — only position counts, instrument breadth, and
infrastructure improve.

### $1,000 (current)
- Cash account, long-only, 3 satellites max, fractional core, whole-share
  satellites under ~$300.
- Constraint: position granularity. Sector ETFs as proxies where stop math
  fails. Expect lumpy sizing; that's fine.
- Tax: gains are short-term (ordinary income); immaterial in $ but **wash
  sales matter from day one** — the 3-session re-entry ban plus journaling
  every loss-then-rebuy keeps the record clean. No day-trading concerns in
  a cash account (no PDT), only GFV discipline.

### $5,000
- Same rules; satellites → 4 max (heat cap rises to 6% in BULL_QUIET via the
  quarterly amendment process, with evidence from the live track record).
- Whole-share universe widens (~$1,000/position); fewer ETF proxies, more
  single names. Watchlist may grow to 30.
- Begin computing Sharpe/Sortino meaningfully (enough equity history).

### $10,000
- Decision point: convert to margin account? NOT for leverage — for
  settlement flexibility (no GFV risk) and instant deposits. PDT now applies
  (account < $25k on margin): the no-day-trading rule keeps us naturally
  compliant, but track the rolling 5-day day-trade counter anyway
  (FAILURE_MODES #21 expands to PDT monitoring).
- Execution upgrade: split entries into 2 tranches (half on trigger, half
  on first follow-through) — improves average entry on failed signals.
- Tax: estimated-tax awareness begins; report realized YTD gains in the
  monthly pack.

### $25,000
- PDT restriction lifts (if margin). Day trading remains out of scope —
  the edge is swing/positional; faster trading is a different, harder
  business. The freed capability is used only for same-day defensive exits
  no longer being rationed.
- Diversification of strategy, not just names: 2 sleeves (e.g., trend system
  + a separately validated MR system) with sleeve-level risk budgets.
- Consider moving a slice to tax-advantaged wrappers for the long-term core
  (the user's Roth IRA exists but is NOT agent-territory — recommendation
  only, per Article II).

### $100,000+
- Liquidity rules start to bind: position < 0.5% of ADV becomes a real check;
  spread budget tightens (0.15% hard).
- Execution: limit ladders / time-sliced entries replace single marketable
  limits; slippage tracked per trade vs arrival price in the metric pack.
- Tax becomes a first-class input: prefer ≥ 1-year holds for the core sleeve
  (LTCG), harvest losses deliberately in December (within wash-sale rules),
  report after-tax returns. Engage a human tax professional — that is
  explicitly outside the agent's competence.
- Infrastructure: dedicated data feed beyond the broker API, automated
  reconciliation, and a real backtesting codebase under `backtests/` become
  mandatory, not optional.
- Governance: quarterly review gains a "capacity" section — at what size
  does each playbook degrade? Trend-following on mega-caps scales far past
  $100k; MR on ETFs scales; anything else gets re-validated.

### Tier-promotion rule
Moving up a tier requires: 2 consecutive quarters of live track record at
the current tier meeting all PERFORMANCE_EVALUATION minimums, zero
unresolved violations, and explicit user sign-off. New deposits don't skip
the queue: capital added mid-tier trades under current-tier rules until the
promotion review.

## 6. Deployment Phases (where we are)

| Phase | Gate to advance | Status |
|---|---|---|
| 0. Build | docs complete, watchlist live | ✅ done (2026-06-12) |
| 1. Paper | §3 paper gate passed | ⟵ **current** (also awaiting deposit) |
| 2. Live-minimal | first 10 live trades at half risk (0.75% BULL_QUIET) | pending |
| 3. Live-full | 10 trades clean: no hard violations, expectancy > 0 | pending |
| 4. Scale | tier-promotion rule | pending |
