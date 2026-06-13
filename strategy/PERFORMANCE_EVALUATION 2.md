# PERFORMANCE EVALUATION — Metrics, Thresholds, and Gates

Data sources: the trade journal (one file per trade, R-multiples recorded at
exit), `state/account_state.json` (equity snapshots — the daily run appends
equity to `state/equity_curve.csv`: date,equity,cash,heat,regime), and
benchmark bars (QQQ via historicals).

Sample-size discipline: trade-level metrics are reported but NOT acted upon
until **n ≥ 20 closed trades**; account-level ratios (Sharpe/Sortino) need
**≥ 60 daily equity observations**. Before that, the only enforceable
standard is rule adherence.

---

## 1. Metric Definitions & Thresholds

| Metric | Definition (as computed here) | Minimum acceptable | Target | Breach action |
|---|---|---|---|---|
| **CAGR** | (equity_end/equity_start)^(252/days) − 1, incl. cash drag | > 0 over rolling 12m | > QQQ B&H over rolling 12m | 12m review |
| **Sharpe** | mean(daily ret − rf/252) / stdev(daily ret) × √252; rf from 3m T-bill (websearch quarterly) | ≥ 0.5 | ≥ 1.0 | de-risk review |
| **Sortino** | same but downside deviation only | ≥ 0.8 | ≥ 1.5 | de-risk review |
| **Win rate** | winners / closed trades | ≥ 35% | 45–55% | playbook audit |
| **Expectancy** | mean R-multiple per closed trade | ≥ +0.10R | ≥ +0.35R | see §3 gates |
| **Profit factor** | gross wins $ / gross losses $ | ≥ 1.2 | ≥ 1.8 | playbook audit |
| **Max drawdown** | peak-to-trough on daily equity curve | ≤ 10% (8% breaker + gap allowance) | ≤ 6% | breaker protocol |
| **Recovery factor** | net profit / max drawdown | ≥ 1.0 at 12m | ≥ 2.0 | strategy review |
| **Exposure %** | avg (equity − cash)/equity across days | 30–85% band | 50–75% in bull regimes | regime-logic audit |
| **Alpha vs QQQ** | strategy return − β×QQQ return (β from 60d regression; at this scale, report simple excess return AND beta-adjusted) | > −2% rolling 6m | > 0 rolling 6m | §3 gates |

Supplementary (reported, no threshold): avg win R, avg loss R (must stay
≈ −1R or better — worse means stops are slipping), max consecutive losses,
heat utilization, per-playbook and per-regime expectancy, slippage per trade
(fill vs trigger price).

## 2. Reporting Cadence

- **Daily**: equity, day P&L, heat, regime — one line appended to
  `state/equity_curve.csv`, one-sentence report to user.
- **Weekly**: scoreboard vs QQQ, open-risk table, closed-trade audit,
  violation count (target: 0).
- **Monthly**: full metric pack vs thresholds table, expectancy by playbook
  and by regime, scoring-distribution audit.
- **Quarterly**: everything + walk-forward revalidation + governance review.

## 3. Hard Performance Gates (self-termination honesty)

These force the system to confront failure rather than narrate around it:

1. **Expectancy gate**: ≤ 0R over the last 20 closed trades → cut all new
   trade risk by half. ≤ 0R over the last 30 → STOP live trading, revert to
   paper, full strategy post-mortem to the user. Resumption requires the
   paper gate in IMPLEMENTATION_ROADMAP §3.
2. **Drawdown gate**: the 8% circuit breaker (RISK_FRAMEWORK Layer 2). Two
   breaker trips within 6 months → live trading stops pending user-approved
   strategy revision.
3. **Benchmark gate**: 12 consecutive months underperforming QQQ buy-and-hold
   on BOTH return and max-drawdown → recommend to the user, in plain words,
   moving the capital to the benchmark. The system must be willing to fire
   itself; that recommendation is a success of governance, not a failure.
4. **Adherence gate**: any month with ≥ 3 hard-limit violations → trading
   stops regardless of P&L until the process failure is diagnosed.

## 4. Attribution Honesty Rules

- Process-wrong wins are recorded as failures; process-correct losses as
  successes. The monthly pack reports both counts.
- Never report "up X% this month" without the same-period QQQ figure beside
  it. Never report return without max drawdown.
- Luck flag: if > 50% of a month's P&L came from one trade, say so.
- All metrics computed on REALIZED data; open-position marks are shown
  separately and never blended into closed-trade statistics.
