# RISK FRAMEWORK — Multi-Layer Risk Management

Supersedes `RISK_RULES.md` (v1) as the authoritative risk document; the v1
file remains as a quick-reference card. Precedence: `GOVERNANCE.md` > this
file > everything else. **Hard limits** are inviolable — breach = trade
blocked or position closed, logged by the Compliance Auditor. **Soft limits**
trigger review and de-risking bias but not forced action.

---

## Layer 1 — Trade Risk

| Limit | Hard | Soft |
|---|---|---|
| Risk per trade (entry−stop × shares / equity) | regime max (0.75–1.5%) | 80% of regime max when `consecutive_losses ≥ 2` |
| Position notional | 30% of equity | 25% |
| Protective stop | required before entry is approved; never widened | — |
| Reward:risk at entry | ≥ 2:1 (MR: ≥ 1.5:1 to range mid) | ≥ 2.5:1 preferred |
| Entry slippage budget | limit ≤ 0.5% beyond trigger; gap > 2% = no trade | — |

## Layer 2 — Portfolio Risk

**Portfolio heat** = Σ over open positions of
`max(0, (current_stop_basis_risk)) / equity`, where a position with stop at
or above breakeven contributes 0.

| Limit | Hard | Soft |
|---|---|---|
| Portfolio heat | regime cap (0–4.5%) | 66% of cap (add nothing above it without an exceptional ≥85-score setup) |
| Open satellite count | regime max (0–3) | — |
| Min cash | regime floor (10–95%) | floor + 5% |
| Daily equity loss | −4% in one day → no new entries until next session (hard) | −2.5% → finish the session defensively |
| Drawdown from high-water mark | −8% → circuit breaker: flatten satellites, 5-session cooldown, written post-mortem, user notified | −5% → halve all new-trade risk |

## Layer 3 — Correlation Risk

The hidden killer on a concentrated long book: 3 positions that are really
1 position.

**Correlation buckets** (assign every holding to exactly one):
`mega-tech/semis` (QQQ, SMH, NVDA, AMD, AVGO, MSFT, META, GOOGL),
`consumer-platform` (AMZN, SHOP, UBER, TSLA), `financials` (XLF, HOOD),
`energy` (XLE), `healthcare/bio` (XBI, XLV), `defensives` (XLP, XLU),
`industrial/materials` (XLI, XLB), `other`.

| Limit | Hard | Soft |
|---|---|---|
| Satellites per bucket | 2 | 1 |
| QQQ-equivalent exposure: core + (mega-tech bucket satellites count 1:1) | 60% of equity | 50% |
| All-satellite same-bucket book | forbidden when 3 satellites are open | — |
| Pairwise check | if in doubt, compute 60-session daily-return correlation from historicals; ρ > 0.8 ⇒ same bucket regardless of label | — |

## Layer 4 — Market Regime Risk

| Limit | Hard | Soft |
|---|---|---|
| Regime posture matrix (STRATEGY_v2 §2) | binding | — |
| BEAR_CRISIS | exits only | — |
| Regime change pending (1–2 of 3 confirming closes) | — | no new entries while confirmation is pending |
| Event risk: FOMC / CPI day | — | no new entries on the day of a known major macro release |
| Single-name event risk | no entry with earnings ≤ 10 calendar days out; exit before earnings if held (hard) | — |

## Layer 5 — Liquidity Risk

| Limit | Hard | Soft |
|---|---|---|
| Avg daily dollar volume | > $50M | > $200M preferred |
| Share price | ≥ $5 | $20–$300 (whole-share + GTC stop feasibility) |
| Position vs liquidity | position < 0.01% of ADV (trivially satisfied at this size; binding rule for scaling) | — |
| Order types | marketable limit entries/exits; stop_market GTC protection; plain market orders forbidden except emergency liquidation | — |
| Spread | skip entry if bid-ask spread > 0.3% of price | > 0.15% |
| Halted/non-active state on quote | no orders | — |

## Tempo Caps (single authoritative definition — adopted 2026-06-12, audit C4/C7)

New-entry caps: per the STRATEGY_v2 §2 posture matrix (regime-dependent,
0–4 entries/week), plus max 2 entries/day in any regime. **Exemption
(risk-reducing)**: protective stops, stop ratchets, mandated exits (time
stop, earnings exit, regime exit, breaker/floor liquidation), and partial
profit-takes at plan levels are NEVER counted against, or blocked by, any
tempo cap. Tempo caps govern new risk only. CLAUDE.md and the v1 cards
defer to this paragraph.

## Volatility-Adjusted Position Sizing (the only sizing formula)

```
risk_$   = equity × regime_risk_pct × loss_streak_modifier
stop_d   = regime_ATR_multiple × ATR14   (or structure stop if tighter, ≥ 1.5×ATR)
shares   = floor(risk_$ / stop_d)
notional = shares × entry_price
```
Then apply caps in order: notional ≤ 30% equity → heat cap → cash floor.
If `shares < 1`, the name is too volatile/expensive at this equity — use the
sector ETF proxy or skip. `loss_streak_modifier`: 1.0 normally; 0.5 after 3
consecutive losses until 2 of the next 3 trades win.

High-vol names automatically get smaller positions because ATR is in the
denominator — that is the point. Never override it because conviction is high.

## Portfolio Heat Worksheet (run before EVERY entry)

1. Current heat = Σ open-position risk (stop-basis) / equity.
2. Proposed trade adds `risk_$ / equity`.
3. New heat ≤ regime cap? Bucket limits OK? Cash floor OK after purchase?
   Settled funds sufficient (T+1)?
4. Any "no" → trade rejected. Record the rejection and reason in the journal —
   rejected trades are data.

## Stop Integrity Rules

1. Every position has a live GTC `stop_market` order, verified every daily
   run (`get_equity_orders`). Missing stop = fire alarm: replace before any
   other action.
2. Stops ratchet only toward profit. Widening = constitutional violation.
3. Fractional-share positions (core QQQ) cannot carry exchange stops:
   the core is protected by the regime rotation rule instead; fractional
   satellites are forbidden unless sized at half risk and checked daily.
4. After a stop fills, 3-session re-entry ban on that name (5 for MR).
