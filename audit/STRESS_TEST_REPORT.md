# STRESS TEST REPORT — Monte Carlo Analysis of the v2 System
**Date**: 2026-06-12 · **Engine**: `backtests/montecarlo_v2.py` (pure Python, seed=42, reproducible)
**Honesty header**: This is NOT a backtest and NOT a forecast. It simulates the system's *rules* (regime posture, risk %, R-distributions, breaker, loss-streak halving, core trend filter with detection lag) against a synthetic regime-switching market. Every output is downstream of the input assumptions printed in the script. Its purpose is to test the *plumbing* (do the risk controls bound outcomes?) and to find which assumptions dominate — not to promise returns.

---

## 1. What Was Modeled

- **Market**: 3-state regime-switching daily QQQ (bull μ+0.08%/σ1.1%, chop 0%/1.3%, bear −0.12%/σ2.4%), Markov transitions, plus a 0.2%-daily-probability −4.5% jump shock. 756 trading days (3 years) per path.
- **Core sleeve**: QQQ exposure 40%/20%/0% by detected regime, with a 3-day detection lag (models the 3-close hysteresis).
- **Satellites**: Poisson-ish trade arrival (0.30/day bull, 0.15/day chop, 0 in bear), max 3/2/0 open, risk 1.5%/1.0%, hold ~8 days. Win rate 45% (bull) / 40% (chop). Winner R-distribution {1R:35%, 2R:40%, 4R:20%, 6R:5%} (mean +2.25R); loser distribution {−1R:85%, −1.4R:12%, −2.5R:3%} (mean −1.10R, models slippage and gap-through-stop tails).
- **Risk plumbing as designed**: 8% breaker (flatten, 5-day cooldown, half-risk next 10 trades), loss-streak halving after 3, two-trips-in-6-months → 8-week paper period. Breaker re-arm at resumption equity (the V3 fix — see §4).
- **Ruin** defined as −30% from start (the level at which the system has comprehensively failed its mandate, far past every gate).

## 2. Results (converged; 1k/5k/10k agree to within noise)

### Base case
| Metric | n=1,000 | n=5,000 | n=10,000 |
|---|---|---|---|
| 3y CAGR — mean | +22.1% | +22.7% | **+22.6%** |
| 3y CAGR — median | +20.0% | +20.2% | **+20.2%** |
| 3y CAGR — p5 / p95 | +1.4% / +50.8% | +1.3% / +51.9% | **+1.2% / +52.0%** |
| 1y return — median (p5/p95) | +23.2% (−5.9/+87.9%) | +24.2% | **+23.5% (−5.7/+88.5%)** |
| Max drawdown — median | 12.4% | 12.3% | **12.2%** |
| Max drawdown — p95 / worst | 20.1% / 28.8% | 19.9% / 32.0% | **19.9% / 32.0%** |
| Time underwater (any amount below HWM) | 90% | 90% | **90%** |
| P(beat QQQ) — 1y / 3y | 76% / 88% | 77% / 90% | **77% / 89%** |
| P(negative 3y) | 3% | 4% | **4%** |
| **Risk of ruin (−30%)** | 0.00% | 0.02% | **0.01%** |
| Breaker trips per 3y — mean | 2.59 | 2.61 | **2.60** |

### Sensitivity sweeps (n=10,000 each)
| Scenario | 3y CAGR med | MaxDD med/p95 | P(beat QQQ, 3y) | P(neg 3y) | Ruin |
|---|---|---|---|---|---|
| Base (wr 45%) | +20.2% | 12.2% / 19.9% | 89% | 4% | 0.01% |
| Edge erosion (wr −5pts) | +11.1% | 14.0% / 23.4% | 76% | 11% | 0.04% |
| **Edge gone (wr −10pts)** | +3.8% | 16.5% / 27.5% | 57% | 30% | 0.37% |
| Fat winners cut (payoff ×0.8) | +10.3% | 13.5% / 22.6% | 75% | 11% | 0.01% |
| Both stressed (−5pts, ×0.8) | +4.1% | 15.8% / 26.6% | 57% | 29% | 0.25% |

## 3. Findings

1. **The risk plumbing works.** Even with the edge entirely removed (35% win
   rate — a strictly bad trader), risk of ruin stays at 0.37% and median
   outcome is roughly flat, not catastrophic. The posture matrix, heat caps,
   and breaker convert "no edge" into "wasted time" rather than "destroyed
   capital." That is exactly what they are for, and it is the single most
   important result in this report.
2. **Returns are entirely hostage to the edge assumption.** Win rate ±5pts
   moves median CAGR by ±9 points; the 6R tail of the winner distribution
   carries a quarter of total return (payoff ×0.8 halves CAGR). Nothing else
   in the system — not the breaker, not regime detection speed, not trade
   frequency — comes close. **The dominant assumptions, ranked: (1) win
   rate, (2) winner R-distribution fat tail, (3) regime transition/detection
   lag (drives DD, not CAGR), (4) everything else, far behind.** The 45%/
   +2.25R assumption is taken from trend-following literature, NOT from this
   system's own track record. Until ≥20 live trades exist, treat base-case
   CAGR as illustrative fiction with honest error bars.
3. **The documented "≤10% max DD" threshold is not achievable** with an 8%
   per-episode breaker: median 3-year MaxDD is 12.2%, p95 ~20%, because
   independent drawdown episodes compound across breaker resets. Audit
   finding C2 confirmed quantitatively. Resolution proposed in
   GOVERNANCE_HARDENING §2 (15% cumulative hard floor + restated envelope).
4. **The breaker re-arm gap is real and material.** First simulation pass,
   with the breaker exactly as documented (no re-arm definition), produced
   57 trips/3y — i.e., near-permanent halt, the deadlock from audit finding
   C3. With the proposed re-arm (anchor reset at resumption), trips fall to
   a sane 2.6/3y. The difference between a working and a deadlocked system
   is one undefined sentence.
5. **Expect to live underwater.** Equity sits below its high-water mark on
   ~90% of days even in strongly profitable paths. This is normal for any
   compounding strategy and must be pre-agreed with the user, or drawdown
   anxiety will manufacture pressure to override.
6. **Breaker frequency expectation**: ~2.6 trips per 3 years means the
   two-trips-in-6-months full-stop gate WILL plausibly fire during normal
   operation (~clustered bears). That gate firing is the system working,
   not failing — also worth pre-agreeing.

## 4. Caveats (what this model cannot see)

Single-name gaps beyond the loser-tail already modeled; intra-position
correlation (satellite P&L is drawn independently of the market path —
real satellites fall WITH the market, so real drawdowns cluster harder than
modeled; treat MaxDD figures as optimistic by ~2–4 points); execution
micro-costs beyond the R-distribution haircut; regime parameters themselves
(estimated, not fitted); and every operational failure in RED_TEAM_REPORT.md
(the model assumes the rules execute perfectly — the red-team report is
about exactly that assumption).

**Reproduce**: `python3 backtests/montecarlo_v2.py 10000 --sensitivity`
