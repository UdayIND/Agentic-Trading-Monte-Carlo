# Weekly Review (run on the weekend)

Produce a short written report for the user with these sections, numbers
first, narrative second.

## 1. Scoreboard
- Equity now vs last week vs starting capital vs high-water mark.
- Benchmark: same-period QQQ buy-and-hold on $1,000. Report the gap honestly,
  in both directions.
- Open positions: symbol, R multiple so far, current stop, days held.

## 2. Closed trades audit
For each trade closed this week: planned R vs realized R, and ONE sentence on
whether the loss/win was process-correct (followed rules, market disagreed)
or process-wrong (rule bent/broken). Process-wrong wins count as failures.

## 3. Rule adherence
- Any rule violations this week? List them plainly. Zero is the target.
- Trade counts vs limits (entries/day, orders/week).
- Were any stops widened, averaged down, or time-stops ignored? (Must be no.)

## 4. Regime & watchlist
- QQQ vs 200-day SMA; breadth impression from watchlist scan.
- Watchlist refresh: drop names that lost trend/RS, propose adds (max 2/week)
  with one-line justifications. Apply changes to the Robinhood list after
  reporting them.

## 5. State file
- Reset `weekly_order_count` to 0.
- Update `consecutive_losses`, `risk_per_trade_pct` (per the 3-loss rule),
  circuit-breaker fields, `last_weekly_review`.

## 6. Strategy feedback loop
- After every 10 closed trades: win rate, avg win R, avg loss R, expectancy.
- If expectancy is negative over 20+ trades, recommend pausing live trading
  and reverting to paper analysis — say this directly; do not soften it.
- Any proposed strategy/risk changes go to the user in writing. Never edit
  STRATEGY.md or RISK_RULES.md without explicit user approval.
