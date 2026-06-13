# TRADE_PLAN_{TICKER} — {YYYY-MM-DD}
Status: {draft | verified | executed | cancelled({reason})}
Conviction: {pre-challenge} → {post-challenge} · Playbook: {TF|BO|PB|MR} · Regime: {code}
Linked artifacts: BULL_CASE_{T}.md · BEAR_CASE_{T}.md · risk worksheet · TOP_OPPORTUNITIES rank {n}

## The Eleven (all required — an empty field voids the plan)
| Field | Value | Basis |
|---|---|---|
| 1. Entry plan | {order type, limit price, trigger condition, session} | {trigger evidence} |
| 2. Initial stop | ${} | {structure level / n×ATR14={}; GTC stop_market} |
| 3. Profit target 1 | ${} (+2R or structure) | {action: sell ½, stop → breakeven} |
| 4. Profit target 2 | ${} | {action at T2, e.g. sell ¼, trail rest} |
| 5. Final exit logic | {trail method / time stop day / regime stop / earnings date exit} | |
| 6. Expected holding period | {n} sessions | {playbook norm} |
| 7. Position size | {n} shares (${} notional, {x}% of equity) | {vol-adjusted formula shown} |
| 8. Risk amount | ${} = {x}% of equity | {regime max check} |
| 9. Maximum loss (gap-case) | ${} (notional × assumed −20% gap) | {sanity: survivable} |
| 10. Expected reward | ${} to T1+T2 blended | |
| 11. Expected R multiple | {x.x}R blended | {≥ 2:1 floor check} |

## Invalidation conditions (observable, pre-committed)
1. {price-based — usually the stop}
2. {thesis-based — "sector drops from top-3", "news X reverses"}
3. {time-based — time-stop date}

## Heat & correlation after entry
Portfolio heat: {x}% → {y}% (cap {z}%) · Bucket: {name} ({n}/2) · QQQ-equiv: {x}%/60%

## Pre-execution verification (Stage 6 — at order time, fresh data)
| # | Check | Pass/Fail | Evidence |
|---|---|---|---|
| 1 | Still best available opportunity | | vs TOP_OPPORTUNITIES rank 2: {} |
| 2 | News unchanged since intel report | | |
| 3 | Volatility unchanged (ATR, spread) | | plan ATR {} vs now {} |
| 4 | Regime unchanged, none pending | | |
| 5 | Earnings risk unchanged | | |
| 6 | Sizing correct at live price | | recomputed: {} shares |
| 7 | R:R still ≥ floor at live prices | | {x.x}:1 |
**Result**: {PROCEED | CANCELLED on #n} · Attempt {1|2} of 2 max
