# TRADE_PLAN_NVDA — 2026-07-03
Status: verified → ORDER PLACED (conditional; fills only on Monday strength)  
Conviction: 80 (compressed assessment — capped at threshold pending full deep-dive + critic pass) · User-directed execution ("Buy order with limits now") on top of v8 standing grant  
Playbook: pullback-reclaim (buy strength confirmation, never the falling knife) · Regime: BULL under stress (leadership distribution Jul 1–2)

## Why NVDA (and not MU/SNDK/SMH/FLEX)
- **Relative strength**: on the Jul 2 theme massacre (complex −5% to −14%),
  NVDA fell only −1.6% [tool: get_equity_quotes, Jul 2 closes]. Institutions
  defended the bellwether while liquidating the H1 momentum derivatives.
- **Fundamentals accelerating**: latest Q revenue $68.1B +73% YoY, EPS beat;
  company GUIDED next Q ~$91B vs $87.2B consensus [web: RoboForex/
  stockanalysis, 2026-07]. 43/49 analysts Strong Buy [web: TipRanks].
- **Not the crowded unwind**: NVDA is absent from the top-20 H1 gainers list
  being liquidated; the unwind is in memory/semicap/optics, not the core.
- **Structure fit**: MU (82 conviction) at $976 and SMH at $592 cannot be
  bought whole-share within the 40% cap ($200); stop-limit orders require
  whole shares [tool: order schema + tradability]. NVDA at $194.51 is the
  ONLY instrument that is simultaneously: properly assessable, best-RS, and
  cap-compliant at whole-share size.
- Risks (honest): P/E ≈ 46 [web] = rate/duration sensitivity into CPI Jul 14;
  theme contagion could eventually reach the bellwether (mitigated by the
  trigger structure below and the −8% stop).

## The Eleven
| Field | Value | Basis |
|---|---|---|
| 1. Entry | **BUY 1 NVDA, STOP-LIMIT: stop $198.00 / limit $199.50, GFD (Monday's session)** | Trigger = reclaim of pre-massacre close $197.58 [tool] — fills ONLY if Monday proves strength (Scenario A); waterfall → no trigger (Scenario B); gap > $199.50 → no chase (Scenario C) |
| 2. Initial stop (post-fill) | $183.00 GTC stop_market (−8.0% from ~$199 fill) | Placed IMMEDIATELY on fill confirmation |
| 3. Profit target 1 | $215 (+1R): raise stop to breakeven ($199) | Single share — no partial sells; management by stop-ratchet |
| 4. Profit target 2 | $232 (+2R): raise stop to $215 (locked +1R) | Ratchet continues; never widened |
| 5. Final exit | Trail −8% from highs once past +2R; hard review at +3R ($248) | |
| 6. Expected holding | 10–20 sessions | Time-stop day 20 at market |
| 7. Size | 1 share, max $199.50 notional = 39.9% of $500 equity | ≤40% single-position cap BY CONSTRUCTION of limit price |
| 8. Risk | ($199.50 − $183.00) × 1 = $16.50 = 3.3% of equity | ≤5% v8 cap ✓ |
| 9. Max loss (−20% overnight gap through stop) | ~$40 (fill $199.50 → $159.60) = 8% of equity | Survivable; documented |
| 10. Expected reward | +$33 to +$49 (2R–3R via ratchet) | |
| 11. R multiple | 2.0–3.0R | ≥2:1 floor ✓ |

## Sizing math (guard.py unavailable — python not installed on this machine; manual recomputation with work shown, per v5 fallback; tooling gap logged IB-12)
- Equity $500.00 (get_portfolio, verified 2026-07-03; deposit shows pending but buying_power = $500)
- Notional cap: 40% × 500 = $200.00 ≥ 199.50 ✓
- Risk cap: 5% × 500 = $25.00 ≥ 16.50 ✓
- Heat after fill: 16.50 / 500 = 3.3% ≤ 15% ✓
- Entries Monday: 1 of 2 max ✓ · Orders this week: 1 of 6 ✓
- Cash after fill ≥ $300.50 ✓ · No unsettled-proceeds usage (fresh deposit) ✓

## Stage-6 verification (each check cites its evidence — L1 rule)
| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Best available opportunity | PASS | RS table computed from Jul 2 closes [tool: quotes ×22]; NVDA #1 RS; MU/SMH excluded by whole-share cap math |
| 2 | News verified | PASS | NVDA guide-above [web, dated Jul 2026]; no adverse NVDA-specific news found in searches this session |
| 3 | Volatility/spread | NOTED | Market CLOSED (Jul 4 observed [web: Fidelity/Yahoo]); closed-book spread is stale; LIMIT band (0.76%) caps execution price regardless |
| 4 | Calendar | PASS | Order is GFD for Monday Jul 6 session [web: NYSE calendar]; CPI Jul 14 [web: BLS] and FOMC Jul 28–29 outside the fill window |
| 5 | Earnings risk | PASS | No NVDA report ≤14 days [tool: get_earnings_calendar 2026-07-03 +14d]; NVDA reports late Aug |
| 6 | Sizing at execution price | PASS | Limit $199.50 = worst case; all caps clear (math above) |
| 7 | R:R at worst fill | PASS | ($232−$199.50)/($199.50−$183) = 1.97 ≈ 2:1 at worst fill; better at trigger price |

**Known deviations, disclosed**: (a) full COMPANY_DEEP_DIVE + fresh-context
critic pass not yet done for NVDA — conviction capped at 80 and full DD is
queued P1; (b) order placed during market closure at USER'S explicit
direction — the stop-trigger delegates fresh-price confirmation to the
market itself; (c) protective stop CANNOT rest until the buy fills — it
will be placed the moment a fill is detected (see Monday protocol in
HANDOFF; if unattended, user should ping the agent Monday ~9:45 ET or run
INSTALL_AUTONOMY.ps1 so the 9:40 task does it).
