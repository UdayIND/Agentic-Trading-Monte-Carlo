# RISK RULES — Non-negotiable (v1 quick-reference card)

> **Authoritative document is now `RISK_FRAMEWORK.md`** (2026-06-12). This
> card stays as a fast pre-trade sanity check. Where they differ, the
> framework wins.

These are hard constraints. They are checked BEFORE every order. Any single
failure = no trade. They exist because the #1 documented failure mode of
LLM trading agents is unconstrained churn and risk drift, and the #1 killer
of small accounts is position sizing, not stock picking.

## Per-trade

| Rule | Limit |
|------|-------|
| Max risk per trade (entry − stop) × shares | **1.5% of account equity** (~$15 on $1,000) |
| Max position size (cost basis) | **30% of account equity** |
| Protective stop | Required on every position, defined BEFORE entry, never widened |
| Minimum reward:risk at entry | **2:1** to the realistic target |
| Order type | Marketable limit only for entries; stop_market GTC for protection |
| Liquidity floor | Avg daily dollar volume > $50M; no stocks under $5 |

## Portfolio

| Rule | Limit |
|------|-------|
| Max open swing positions | **3** (plus the core ETF position) |
| Max total open risk (sum of all entry−stop distances) | **5% of equity** |
| Max single-sector concentration (satellites) | 2 positions in the same sector |
| Cash buffer | Keep ≥ 10% in cash at all times |
| Instruments | US-listed stocks and ETFs only. No options, no crypto, no leveraged ETFs held > 5 days, no inverse ETFs |

## Tempo (anti-churn)

| Rule | Limit |
|------|-------|
| New entries per day | Max **2** |
| Orders per week (all types except stop adjustments) | Max **6** |
| Same-day round trip | **Never** (also avoids good-faith violations in a cash account) |
| Re-entering a ticker after stopping out | Wait 3 trading days minimum |

## Circuit breakers

| Trigger | Action |
|---------|--------|
| Account equity down **8% from high-water mark** | Close all satellite positions, set `circuit_breaker: true` in state file, 5-trading-day cooldown, mandatory written post-mortem before resuming |
| Single day equity drop ≥ 4% | No new entries until the next trading day |
| 3 consecutive losing trades | Halve risk per trade to 0.75% until 2 of the next 3 trades are winners |
| Market regime: QQQ closes below its 200-day SMA | No new satellite entries; core position rotates to cash per STRATEGY.md |

## Process invariants

1. `review_equity_order` before every `place_equity_order`. No exceptions.
2. Position size formula: `shares = floor(account_risk_$ / (entry − stop))`,
   then cap by the 30% position-size limit. The stop distance determines the
   size — never the other way around.
3. If a protective stop order can't be placed (e.g., fractional shares), the
   position may only be held if the daily routine is actively monitoring it,
   and it must be sized at half the normal risk.
4. Settled-funds check before every buy: confirm `buying_power` covers it and
   recent sales have settled (T+1).
5. Never average down. Never widen a stop. Never "give it one more day" past a
   time stop. These three sentences override any analysis you produce.
