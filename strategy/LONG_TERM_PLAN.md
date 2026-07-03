# LONG-TERM PLAN (v8.1) — Systematic Accumulation Program

Adopted 2026-07-03 by user directive in writing (Art V): *"Update the plan
to a long-term plan… I will add $500 every month. This is really
important."* Combined with the standing v8 directives (high risk/high
returns; autonomous execution; "worst thing is getting tanked").

**This document is the master capital plan. The v8 HIGH_RISK_MANDATE
parameters now govern the SATELLITE sleeve defined here. All v1–v8 gates,
anti-churn caps, and honesty rules are unchanged.**

## 1. The central fact: contributions dominate early [calc]

$500 initial + $500/month = $6,500 contributed in year 1. Even a +30%
return on average deployed capital (~$3.5k) adds only ~$1k that year —
**the deposit habit IS the strategy for years 1–5.** The plan's job, in
priority order:
1. Never interrupt the contribution engine.
2. Never lose big enough to break compounding (or the operator's nerve).
3. Compound above the passive benchmark via the satellite's edge — if the
   edge is real (annual review decides with after-tax numbers).

What the program is worth [calc: FV of $500 initial + $500/mo, monthly compounding]:

| Horizon | Contributed | @8%/yr | @12%/yr | @15%/yr |
|---|---|---|---|---|
| 1 year | $6,500 | ~$6,770 | ~$6,900 | ~$7,010 |
| 3 years | $18,500 | ~$20,900 | ~$22,300 | ~$23,300 |
| 5 years | $30,500 | ~$37,500 | ~$41,700 | ~$45,300 |
| 10 years | $60,500 | ~$92,600 | ~$116,700 | ~$139,800 |

Return dollars overtake contribution dollars (~$6k/yr) only when equity
reaches roughly $50k — around year 7 at 12%. Patience is structural, not
optional.

## 2. Architecture — core + satellite

| Sleeve | Target | What | Rules |
|---|---|---|---|
| **CORE** | ~65–70% of equity | QQQ (primary) + SMH (secondary, ≤⅓ of core) accumulated by DCA | Buy on every deposit REGARDLESS of market level or regime. No stops. No selling on drawdowns. Held for years (LT capital-gains treatment). This sleeve is never "managed" — it is owned. |
| **SATELLITE** | ~30–35% of equity | The v8 tactical book: momentum/pullback-reclaim entries in watchlist names | ALL HIGH_RISK_MANDATE rules: risk ≤5% of total equity/trade · heat ≤15% · mandatory stops, never widened · conviction ≥80 + plan + Stage-6 (tool-cited, L1) · anti-churn caps · no averaging down |
| CASH | residual | T+1 settlement buffer | Never buy-then-sell unsettled (GFV) |

**Why this shape**: the core guarantees participation in the market's
long-run compounding (the thing that actually builds the account); the
satellite pursues the high-risk/high-return mandate with capped blast
radius. A satellite disaster (−35% floor) costs roughly a third of the
account, not all of it — "tanked" becomes survivable by construction.

**Transitional rules (equity < $2,000 — current state):**
- Sleeve targets are aspirational at this size. The live NVDA conditional
  order (6a482004) is grandfathered as satellite trade #1 (~40% of equity
  if filled, stop-protected).
- Each monthly deposit goes **100% to CORE (QQQ)** until core ≥ 55% of
  equity; thereafter deposits split ~$350 core / $150 satellite cash.
- At equity ≥ $2,000: full sleeve accounting begins; quarterly rebalance
  toward 70/30 with ±5% bands (rebalance with NEW deposits first — avoids
  realizing gains; sell only on band breach > 10%).

**No-shared-tickers rule**: the satellite must not trade a ticker the core
holds (QQQ/SMH). A satellite stop-out re-bought by core DCA inside 30 days
is a wash sale (knowledge/tax-basics §2); structural separation prevents it.

## 3. Monthly deposit workflow (runs on deposit arrival, ~1st of month)

1. Verify deposit via get_portfolio (flows.csv append: date, amount,
   VERIFIED). Never act on expected-but-unarrived cash.
2. CORE BUY the same session the deposit settles: QQQ marketable limit,
   fractional OK (market-type orders per tradability rules). No timing
   discretion — DCA discipline is the point. Journal one line.
3. Satellite allocation (once transitional rule satisfied) accrues as
   cash until a setup passes ALL gates. No setup = cash waits. Months
   with zero satellite trades are normal and correct.
4. Update state (equity_curve.csv, account_state.json), commit, push.
5. Monthly risk review (playbooks/monthly-risk-review.md) on the first
   weekend: sleeve drift, flow-adjusted TWR vs benchmark, calibration.

## 4. Risk framework adaptation (deposit-adjusted)

- All drawdown math is **flow-adjusted** (tools/metrics.py TWR / unit-NAV
  method) — deposits are not performance and never mask losses.
- **35% unit-NAV drawdown floor (v8)**: satellite flattens + reverts to
  paper + notify. CORE IS NEVER FLATTENED by the floor — selling the DCA
  core in a drawdown is the exact behavioral failure the plan exists to
  prevent (knowledge/behavioral-finance; market-history base rates: −14%
  intra-year average, −20% every 4–6 years — the core rides these).
- Circuit breaker, loss-streak halving, no-entry windows (CPI/FOMC/
  earnings): unchanged, satellite-scoped.
- Contribution pause is NOT a risk lever: deposits continue in all
  regimes (bear-market deposits are the highest-expectancy purchases of
  the whole program — market-history.md).

## 5. Benchmark & self-termination (honesty)

- Benchmark: **100% QQQ DCA, identical flows** ($500 + $500/mo). Computed
  from the same flows.csv; reported monthly, judged annually after tax.
- If the total program (core+satellite) underperforms the benchmark
  after-tax for 2 consecutive annual reviews, OR the satellite's own
  expectancy is negative over ≥20 trades: satellite is retired and the
  program converges to 100% DCA (which the core already is). The plan
  fails soft, never catastrophically.

## 6. Milestones (scaling tiers)

| Equity | Unlocks |
|---|---|
| $2,000 | Full sleeve accounting; satellite positions sized to sleeve |
| $5,000 | Satellite may hold 3 concurrent (was: capital-constrained ~1–2); SMH added to core mix |
| $10,000 | Single-name CORE additions allowed (only names with a full COMPANY_DEEP_DIVE + critic pass + 2 quarters of thesis tracking; ≤10% of core each) |
| $25,000 | Revisit risk-per-trade (5% → possibly 3–4%: same $ risk, lower %); consider tax-loss-harvesting automation |
| Any tier | Advancement requires: no floor hits in trailing 6 months + positive satellite expectancy |

## 7. Tax discipline (taxable account — knowledge/tax-basics.md)

- Core: never sold → unrealized LT compounding (deferral = interest-free
  loan of the tax). Qualified-dividend holding periods respected.
- Satellite: expect ST gains/losses; harvest losses vs gains at year-end
  (wash-sale-safe via the no-shared-tickers rule + 30-day re-entry checks
  already journaled).
- Annual review computes the after-tax gap honestly (playbooks/annual-review §1).

## 8. Backtest

`backtests/longterm_dca_v1.py` (seed=42, stdlib only, assumptions printed
with every run) Monte-Carlos this exact plan — monthly contributions,
transitional allocation, regime-switching market, satellite rule skeleton
(v8 params), 35% unit-NAV floor→paper — against (a) 100% QQQ DCA and (b)
100% satellite. **It is a simulation of the rules under stated assumptions,
NOT a replay of history**; results live in `backtests/RESULTS_longterm_v1.md`
and are re-run at every quarterly review (parameter changes go through
CHANGELOG).

## 9. What did NOT change

Conviction gates, quality gates, Stage-6 tool-cited verification (L1),
anti-churn caps, no-averaging-down, stop discipline, breaker, autonomous-
execution conditions (v8 §3), DO-NOTHING default, epistemic labels,
evidence tags, honesty standing orders — all intact. This plan adds a
contribution engine and sleeve structure on top of the machine; it removes
zero safety hardware.
