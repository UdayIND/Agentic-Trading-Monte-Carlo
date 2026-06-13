# STRATEGY v2 — Regime-Adaptive Trend & Momentum System

Supersedes `STRATEGY.md` (v1). Precedence: `GOVERNANCE.md` > `RISK_FRAMEWORK.md`
> this file > playbooks. Design priority, in order: survivability,
risk-adjusted return, robustness, discipline. Raw return is fourth.

---

## 1. Market Regime Classification

Computed by the Regime Analyst (see `AGENT_ARCHITECTURE.md`) from QQQ and SPY
daily bars (`get_equity_historicals`, 1 year, day interval). Re-classified
daily; regime CHANGES require confirmation (see hysteresis) to prevent
whipsaw.

### Trend axis (QQQ)
| State | Definition |
|-------|-----------|
| **Bull** | Close > 200d SMA AND 50d SMA > its value 20 sessions ago |
| **Bear** | Close < 200d SMA AND 50d SMA < its value 20 sessions ago |
| **Sideways** | Anything else (mixed signals) |

### Volatility axis (QQQ)
20-day realized volatility (stdev of daily log returns × √252), ranked
against the trailing 252-session distribution:
| State | Definition |
|-------|-----------|
| **High-vol** | 20d RV above the 75th percentile of the trailing year |
| **Normal** | 25th–75th percentile |
| **Low-vol** | Below the 25th percentile |

### Composite regimes (trend × vol)
| Regime | Code | Character |
|--------|------|-----------|
| Bull / Low-or-Normal vol | **BULL_QUIET** | Best environment; full system on |
| Bull / High vol | **BULL_VOLATILE** | Trend intact but violent; reduce size |
| Sideways (any vol) | **RANGE** | No trend edge; mean-reversion only, small |
| Bear / Low-or-Normal vol | **BEAR_QUIET** | Distribution; near-flat, rare shorts N/A (long-only) |
| Bear / High vol | **BEAR_CRISIS** | Stand aside entirely |

### Hysteresis (anti-whipsaw)
- A regime change is only acted on after **3 consecutive daily closes**
  confirming the new state.
- After acting on a regime change, no opposite-direction regime action for
  5 sessions.
- Record every classification in `state/account_state.json`
  (`regime`, `regime_checked`, `regime_note`).

## 2. Regime → System Posture Matrix

All percentages are of total account equity. RISK_FRAMEWORK.md caps always
apply on top.

| Parameter | BULL_QUIET | BULL_VOLATILE | RANGE | BEAR_QUIET | BEAR_CRISIS |
|---|---|---|---|---|---|
| Core (QQQ) allocation | 40% | 25% | 20% | 0% | 0% |
| Max satellites | 3 | 2 | 2 | 1 | 0 |
| Risk per trade | 1.5% | 1.0% | 1.0% | 0.75% | — |
| Max portfolio heat | 4.5% | 2.0% | 2.0% | 0.75% | 0% |
| Min cash | 10% | 25% | 35% | 70% | 95%+ |
| New entries / week | 4 | 2 | 2 | 1 | 0 |
| Active playbooks | TF, BO, PB | PB only | MR only | PB (A+ only) | none |
| Stop multiple (×ATR14) | 2.0 | 2.5 | 1.5 | 2.0 | — |

Playbook codes: TF = trend-following, BO = breakout, PB = pullback,
MR = mean-reversion. In BEAR_CRISIS the only permitted actions are exits,
journaling, and research.

## 3. Sector Rotation & Relative Strength

### Sector monitor (weekly, in the weekly review)
Track the 11 SPDR sector ETFs: XLK, XLY, XLC, XLF, XLV, XLI, XLE, XLP, XLU,
XLB, XLRE (plus SMH and XBI as industry reads).

- **RS score** per sector = 0.5 × (1-month return − SPY 1-month return)
  + 0.5 × (3-month return − SPY 3-month return).
- Rank all sectors. **Top 3 = favored**, bottom 3 = excluded.

### Rules
1. New satellite entries must come from favored or rank-4/5 sectors.
   Bottom-3 sectors are untouchable for longs regardless of setup quality.
2. A sector ETF itself is a valid satellite when individual names are too
   expensive for whole-share sizing (account < $5k).
3. Watchlist refresh (weekly): every name must beat SPY on 1-month OR
  3-month RS to stay; adds must beat it on both.

### Stock-level RS filter (entry gate, all playbooks except MR)
- 1-month and 3-month return > SPY's over the same windows.
- Price > 50d SMA. For TF/BO additionally 50d SMA > 200d SMA.

## 4. Setup Playbooks

Each playbook is a card: trigger, context, entry, stop, target, management.
ALL entries also require: liquidity floor (RISK_FRAMEWORK §5), no earnings
within 10 calendar days, opportunity score ≥ 70 (RESEARCH_PROCESS §4), and
Risk Manager + Portfolio Manager sign-off (AGENT_ARCHITECTURE).

### 4.1 Trend-Following (TF) — regime: BULL_QUIET
- **Context**: name in favored sector, above rising 50d SMA, RS positive,
  within 10% of 52-week high.
- **Entry**: buy strength on a close at a new 20-session high, OR first
  touch-and-reclaim of the 21d EMA in an established uptrend.
- **Stop**: 2.0 × ATR14 below entry.
- **Target**: none fixed — this is the runner playbook. Partial ⅓ at +2R.
- **Management**: trail remainder under the 21d EMA (close basis, acted on
  next session). Exit on 2 consecutive closes below the 50d SMA.
- **Time stop**: 15 sessions without a new high-water mark on the position.

### 4.2 Breakout (BO) — regime: BULL_QUIET
- **Context**: consolidation ≥ 15 sessions with range < 1.5 × ATR14 around a
  flat base high; RS positive; volume contracting into the base.
- **Entry**: close above base high on volume ≥ 1.5 × 20d average volume.
  Enter next session with a marketable limit ≤ 0.5% above prior close. If it
  gaps > 2% above trigger, skip — never chase.
- **Stop**: below the base high (failed-breakout line) or 2 × ATR14,
  whichever is tighter, minimum 1.5 × ATR14.
- **Target**: measured move (base depth projected up). Partial ½ at +2R,
  stop to breakeven, trail rest 2.5 × ATR chandelier.
- **Failure rule**: close back inside the base = exit next session,
  don't wait for the stop.

### 4.3 Pullback (PB) — regimes: BULL_QUIET, BULL_VOLATILE, BEAR_QUIET (A+ only)
- **Context**: established uptrend (price > 50d > 200d SMA), RS positive,
  3–7 session orderly decline (no single bar > 1.5 × ATR) into the 10/21d
  EMA zone or prior breakout level. Pullback volume < rally volume.
- **Entry**: first session that reclaims the prior session's high.
- **Stop**: below the pullback low, minimum 1.5 × ATR14, regime multiple max.
- **Target**: prior swing high = first objective. Partial ½ at +2R or the
  prior high (whichever first), breakeven stop, trail rest.
- **A+ definition (required in BEAR_QUIET)**: score ≥ 85 AND sector rank
  top 2 AND pullback held above the 50d SMA.

### 4.4 Mean-Reversion (MR) — regime: RANGE only
- **Context**: liquid large-cap or sector ETF in a defined range ≥ 1 month;
  no earnings; not in a bottom-3 sector.
- **Entry**: RSI(2) < 10 AND close in the lower 25% of the range AND above
  the 200d SMA. Enter limit at/below the close.
- **Stop**: 1.5 × ATR14 below entry — hard, no exceptions (MR losers trend).
- **Target**: middle of the range or the 10d EMA. Take the WHOLE position
  off at target — no runners in MR.
- **Time stop**: 5 sessions. MR that doesn't snap back is broken.
- **Extra limits**: risk 1.0% max, never more than 1 MR position open,
  never re-enter the same name within 5 sessions of an MR stop-out.

## 5. Capital Allocation Algorithm (each daily run)

1. Classify regime → load the posture row from §2.
2. Core sleeve: rebalance toward target core % only if drift > 10% of
   target or regime row changed (max 1 core action/week).
3. Satellite budget = equity − core − min-cash. Each position sized by the
   volatility-adjusted formula in RISK_FRAMEWORK §4, then capped by heat.
4. Anything unallocated stays in cash. Cash is a position; idle is a choice,
   not a failure.

## 6. Expectation Setting (honest math)

At 1.5% risk, 2:1 average payoff, ~45% historical-class win rate on trend
entries, expectancy ≈ +0.35R/trade; at ~6–10 trades/month in BULL_QUIET that
compounds to roughly 15–30% annualized in favorable regimes, ~0 to slightly
negative in RANGE, and small controlled losses in BEAR years. Worst planned
drawdown: 8% breaker + gap allowance ≈ 10–12%. If realized numbers diverge
from this envelope, that's a PERFORMANCE_EVALUATION.md trigger, not a reason
to push harder.
