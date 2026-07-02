# QUANTITATIVE METHODS — Formulas, Uses, and Failure Conditions

Reference module. Money-math belongs to scripts (v5 standing order) — these
notes are for *interpreting* outputs, not hand-computing decisions.
Every model here fails at its assumptions; know them before trusting it.

## 1. Return & risk measures

| Measure | Formula (sketch) | Use | Failure condition |
|---|---|---|---|
| Sharpe ratio | (R − Rf) / σ | Risk-adjusted return, comparable across strategies | Penalizes upside vol; gameable by negative skew (selling tails looks great until it doesn't) |
| Sortino ratio | (R − Rf) / downside σ | Sharpe fixing the upside-penalty | Needs enough downside observations to estimate |
| Alpha / Beta | regression vs benchmark: R = α + β·Rm + ε | Skill vs market exposure decomposition | Benchmark mis-specification manufactures fake alpha; unstable β over regimes |
| Max drawdown | peak-to-trough equity decline | The measure investors actually live; feeds our breaker/floor rules | Sample-dependent — realized MaxDD understates possible MaxDD |
| CAGR | (End/Begin)^(1/yrs) − 1 | The compounding bottom line | Meaningless without the drawdown/vol that produced it |
| VaR (95/99) | loss quantile over horizon | "Normal-day" loss bound; position-level sanity | Says NOTHING beyond the quantile; historical VaR = rearview mirror |
| Expected shortfall (CVaR) | mean loss beyond VaR | Tail severity; better than VaR (coherent) | Tail estimates are data-starved by definition |

This system's implementations: tools/metrics.py (TWR, flow-adjusted
metrics); PERFORMANCE_EVALUATION.md thresholds; backtests/montecarlo_v2.py.

## 2. CAPM & factor models

- **CAPM**: E[Ri] = Rf + βi(E[Rm] − Rf). Single-factor; empirically flat
  security-market line (low-β outperforms its prediction — the low-vol
  anomaly). Use: cost-of-equity intuition, β as exposure language.
- **Fama-French 3/5-factor**: adds size (SMB), value (HML), then
  profitability (RMW) and investment (CMA); momentum (UMD/Carhart) usually
  appended. Use: return attribution — "stock-picking alpha" often dissolves
  into factor exposure once regressed.
- **Factor models generally**: R = Σ βk·Fk + ε. Cross-sectional (Barra) vs
  time-series (FF). Failure: factor definitions drift, premia decay
  post-publication, crowding turns factors into positioning risk.

## 3. Portfolio theory

- **Markowitz MPT**: minimize σ² for target return via covariance matrix.
  The math is right; the inputs are the problem — mean estimates swamp
  everything (error-maximization). Naive 1/N embarrassingly competitive
  (DeMiguel et al. 2009).
- **Black-Litterman**: start from market-implied equilibrium returns,
  tilt with explicit views + confidences. Value to us: the *discipline* of
  stating views with confidence levels, which we already do via the
  conviction framework.
- **Kelly criterion**: f* = edge/odds (binary) or μ/σ² (continuous).
  Full Kelly maximizes log growth and produces brutal drawdowns; fractional
  Kelly (¼–½) is the professional norm. Our fixed-fractional risk (1.5%
  base, RISK_FRAMEWORK) is a deliberately sub-Kelly stance — correct, since
  our edge estimate itself is uncertain (estimation error argues for
  under-betting, never over).

## 4. Simulation & scenario analysis

- **Monte Carlo**: resample/parameterize return paths to see *distributions*
  (of drawdown, of terminal wealth), not point forecasts. Ours:
  backtests/montecarlo_v2.py, seed=42, reproducible. Limits: the simulation
  knows only the distribution you gave it; regime breaks and fat tails
  enter only if modeled.
- **Scenario analysis**: named, severe-but-plausible states (2008 credit
  freeze, 2020 gap-crash, 2022 rate shock) applied to the *current* book.
  Complements (never replaces) statistical measures precisely where they're
  blind. audit/STRESS_TEST_REPORT.md is the working example.

## 5. Statistical practice

- **Regression**: always check residuals, stability (rolling betas), and
  regime subsamples. R² is not economic significance.
- **Correlation**: unstable and crisis-converging (everything → 1 in
  liquidations). Rolling-window correlation > full-sample. Correlation ≠
  causation ≠ tradable relationship.
- **Volatility**: clusters (GARCH-family behavior), mean-reverts;
  realized (from bars — what tools/regime.py computes) vs implied (options
  — the market's forecast). Vol regimes are more persistent than return
  regimes, which is why the regime matrix keys on RV percentile.
- **Overfitting control**: the more parameters/backtests tried, the lower
  the credible out-of-sample expectation (multiple-testing). This is why
  CHANGELOG records rejected variants and GOVERNANCE caps parameter changes
  to quarterly with evidence.

## 6. Drawdown analysis

Depth, duration, and recovery time are separate dimensions; underwater
curves reveal what equity curves hide. Arithmetic of ruin: −20% needs +25%,
−50% needs +100% — the asymmetry that justifies putting capital
preservation first in the priority order.
