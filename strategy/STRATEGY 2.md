# Strategy: Trend-Core + Momentum Satellites (v1 — superseded)

> **SUPERSEDED 2026-06-12 by `STRATEGY_v2.md`.** Kept as a quick-reference
> card. Where this file and v2 differ, v2 wins.

Profile: **medium risk, growth-oriented**, $1,000 starting capital, cash
account, swing-trading timeframe (days to weeks). The edge is process
discipline + trend participation, not prediction. Honest expectation: this
targets beating buy-and-hold QQQ with shallower drawdowns. In a bad tape it
will lose money — the risk rules exist to make those losses small and
survivable. Anyone promising "high return" without that caveat is selling
something.

## Capital allocation ($1,000)

| Sleeve | Allocation | Contents |
|--------|-----------|----------|
| **Core** | 40% (~$400) | QQQ (fractional), trend-filtered |
| **Satellites** | up to 50% (~$500) | 2–3 swing positions, $150–250 each |
| **Cash buffer** | ≥ 10% (~$100) | Always held back |

## Core sleeve (the ballast)

- Hold QQQ fractional shares while QQQ ≥ its 200-day SMA.
- If QQQ closes below the 200-day SMA for 3 consecutive sessions → sell core
  to cash. Re-enter when it closes back above for 3 consecutive sessions.
- Checked in the daily routine; acted on at most once per week.

## Satellite sleeve (the return engine)

### Universe
Liquid large/mega-caps and sector ETFs only. Working watchlist lives on
Robinhood ("Agentic Trading" list). Criteria: avg dollar volume > $50M,
price $20–$300 (so whole shares + real GTC stops are feasible on a $1k
account), optionable names preferred (liquidity proxy).

### Setup (ALL must be true)
1. **Trend**: price > 50-day SMA, and 50-day SMA > 200-day SMA.
2. **Relative strength**: outperformed SPY over the trailing 1 and 3 months.
3. **Entry trigger** — one of:
   - **Pullback**: 3+ down/sideways days into the 10- or 21-day EMA, then a
     day that reclaims the prior day's high; or
   - **Breakout**: closes above a ≥ 3-week consolidation high on volume
     > 1.5× its 20-day average.
4. **No event risk**: no earnings within the next 10 calendar days. Check
   the date before entry; if earnings will land mid-hold, exit before them.

### Position sizing
- Risk per trade: 1.5% of equity (= $15 at $1,000).
- Initial stop: 2 × ATR(14) below entry, or below the pullback low /
  breakout base — whichever is tighter but at least 1.5 × ATR.
- `shares = floor(risk_$ / (entry − stop))`, capped at 30% of equity.
- If that yields 0 whole shares, the name is too expensive/volatile — skip it
  or use a cheaper proxy (sector ETF).

### Exits (mechanical, in priority order)
1. **Hard stop**: GTC stop_market at the initial stop. Never widened.
2. **Partial take**: at +2R, sell half, move stop on the rest to breakeven.
3. **Trail**: after the partial, trail the stop below the 21-day EMA
   (or 2.5 × ATR chandelier, whichever is tighter), updated in the daily run.
4. **Time stop**: flat-to-down after 10 trading days → exit, capital is
   being wasted.
5. **Regime stop**: QQQ circuit condition (RISK_RULES) → exit all satellites.

### What this strategy does NOT do
- No day trading (cash account, $1k — the math and the settlement rules both
  say no).
- No earnings gambles, no penny stocks, no meme chasing without a setup, no
  shorting, no options, no leverage.
- No prediction. Every entry is a reaction to confirmed price behavior with a
  pre-defined invalidation point.

## Expected math (why this can work)

With 1.5% risk and 2:1 minimum reward:risk, a 40% win rate breaks even;
a realistic 45–50% win rate on trend entries compounds meaningfully while a
full 10-trade losing streak costs ~14% — survivable, and the circuit breaker
trips long before that. The asymmetry, not the win rate, is the engine.

## Review cadence

- **Daily** (market hours): `playbooks/daily-routine.md` — manage positions,
  update stops, scan for at most ONE new A+ setup.
- **Weekly** (weekend): `playbooks/weekly-review.md` — performance vs QQQ,
  rule-adherence audit, watchlist refresh, state-file update.
- **Monthly**: re-read this file; propose strategy changes to the user in
  writing with evidence. The agent NEVER changes strategy or risk files
  unilaterally.
