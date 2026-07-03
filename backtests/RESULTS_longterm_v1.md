# LONG_TERM_PLAN Monte Carlo — Results v1 (2026-07-03)

Run: `py -3.12 longterm_dca_v1.py 5000 120` · seed=42 · 5,000 sims × 120
months · assumptions printed by the script (regime-switching market ≈
7–8%/yr blended index return with realistic bear persistence; satellite =
v8 rule skeleton at 5% risk/trade, expectancy +0.41R/trade ASSUMED).
Tooling: 25/25 unit tests green this session; montecarlo_v2.py (2,000
sims) reproduced: 3y median CAGR +20.3%, worst MaxDD 30.9%, P(ruin)=0.

## Headline table (median outcomes, identical market paths across arms)

| Horizon | Contributed | PLAN (core+satellite) | 100% QQQ DCA | 100% satellite |
|---|---|---|---|---|
| 1 year | $6,500 | **$7,431** | $6,954 | $7,036 |
| 3 years | $18,500 | **$26,251** | $20,871 | $23,879 |
| 5 years | $30,500 | **$53,860** | $36,465 | $47,912 |
| 10 years | $60,500 | **$192,653** | $82,139 | $159,541 |

| Risk metric (10y) | PLAN | QQQ DCA | SAT_ONLY |
|---|---|---|---|
| Max unit-NAV drawdown (median) | 36.6% | 46.7% | 36.0% |
| Max DD p95 | 41.9% | 79.8% | 40.4% |
| P(≥1 hit of the 35% floor) | 74.6% | n/a | 68.3% |
| Bad-luck 5th percentile, 10y | $54,905 | $34,828 | $58,596 |

P(PLAN beats QQQ DCA): 62% @1y → 81% @10y · median 10y edge ≈ +$103k.

## What this actually says (read before quoting the table)

1. **[FACT about the model, not the world]** The PLAN's entire edge over
   pure DCA comes from the ASSUMED satellite expectancy (+0.41R/trade —
   the v2 skeleton's number, unproven by any live trade). If the true
   expectancy is zero, PLAN ≈ DCA_QQQ minus nothing (floor prevents decay);
   if negative, the floor caps the damage. The live track record decides —
   LONG_TERM_PLAN §5 retires the satellite after 2 losing annual reviews.
2. **The architecture's PROVEN value is the downside shape**: median worst
   drawdown 36.6% vs 46.7% for pure index DCA, and the catastrophic tail
   (p95: 42% vs 80%) is cut roughly in half. "Don't get tanked" is
   satisfied by construction, not by forecast.
3. **Expect to hit the 35% floor at least once a decade (P≈75%).** That is
   the protocol working, not failing: satellite pauses 3 months, resumes
   half-risk, core keeps compounding, deposits keep buying. Panic at the
   floor is pre-committed away.
4. **Contribution dominance confirmed**: at 1 year the arms differ by only
   ~$400–500 around $7k — 90%+ of year-one growth is deposits. The monthly
   $500 is the strategy; everything else is refinement.
5. SAT_ONLY's apparently similar performance is an artifact of the assumed
   edge plus its sleeve sitting in cash (no market beta): 100% dependent on
   an unproven expectancy, zero participation if the edge isn't real.
   PLAN keeps the market's compounding regardless. That asymmetry — paid
   either way vs paid only-if-right — is why the plan is core+satellite.

## Reproduce / re-run cadence

`py -3.12 backtests/longterm_dca_v1.py 5000 120` (seed fixed). Re-run at
every quarterly review; any parameter change goes through CHANGELOG with
the old/new values and the reason (overfitting control — rejected variants
recorded too).
