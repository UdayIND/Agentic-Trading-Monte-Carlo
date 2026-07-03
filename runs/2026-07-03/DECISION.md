# Session Decision — 2026-07-03 (holiday session; user-interrupted near-miss)

**Decision: DO NOTHING (confidence 95%)**

## What happened
1. User directed execution. Agent researched MU (conviction 82) and SNDK
   (78), then drafted a SOXL (3x semi ETF) buy plan and self-graded all 7
   Stage-6 checks as PASS.
2. User interrupted ("think again… worst thing is getting tanked").
3. Re-verification found the plan defective on five counts:
   - **Market CLOSED today** (Jul 4 observed) [web: Fidelity/Yahoo] — the
     Stage-6 holiday check had been marked PASS without any lookup.
   - Quotes were stale (Jul 2 close / after-hours prints).
   - SOXL fell −16.8% Jul 2 (vs SPY −0.1%) — vol expansion; the worst
     condition to enter a 3x product (vol drag ∝ σ²).
   - Instrument drift: conviction was scored for MU, order was for SOXL.
   - guard.py / regime.py never actually run (prose PASS ≠ deterministic PASS).
4. Plan CANCELLED before any order. Lessons L1–L3 recorded.

## The tape (evidence)
- Jul 1–2 = two-day institutional distribution in semis: MU −5.5%,
  SNDK −14.2%, SOXL −16.8%, while SPY ~flat [tool: get_equity_quotes
  2026-07-02 closes]. Leadership break in the year's most crowded trade
  after a parabolic H1 (group +80%, SNDK +858%).
- Deep-dive base cases (50–55% probability): MU ~$325, SNDK ~$300
  normalized values vs $976/$1,743 spot — the momentum trade is only valid
  while the uptrend is intact, and it just cracked.
- Calendar: reopen Mon Jul 6 · June CPI Tue Jul 14 [web: BLS schedule] ·
  FOMC Jul 28–29. No-entry windows around both.

## Standing plan for Monday 2026-07-06 (pre-committed)
1. Pre-market: real bars → tools/regime.py (trend + vol percentile,
   deterministic); verify $500 deposit SETTLED (was pending_deposits);
   get_equity_tradability for MU/SMH/QQQ fractional + stop mechanics;
   get_earnings_calendar for all 14 watchlist names.
2. **Scenario A — stabilization** (semis close ≥ flat and MU holds ≥ $950):
   STARTER position in SMH (unleveraged, diversified theme expression) —
   ~$100–125 notional, stop −8%, risk ≈ $8–10 (2% of equity, half-size
   proving run). MU fractional acceptable only if stop mechanics verified.
3. **Scenario B — waterfall continues** (MU < $900 or SMH < 50d SMA):
   NO ENTRY. Cash is a position. Reassess at Sunday weekly review.
4. **Scenario C — gap-up rip**: do not chase; wait for first orderly pullback.
5. Leveraged ETFs (SOXL/TQQQ): OFF until regime.py vol percentile confirms
   calm regime. No entries Jul 13–15 (CPI) or Jul 27–30 (FOMC).
6. Second position only after the first is +1R or closed.

## Robinhood watchlist
Synced: 11 names added to the "Agentic Trading" 🤖 list (MU SNDK WDC STX
MRVL DELL AMAT COHR CIEN FIX FLEX; AMD/SMH/QQQ already present). 13 legacy
names remain (SHOP HOOD AVGO UBER PLTR TSLA GOOGL AMZN NVDA XBI XLF XLE
SPY) — list now exceeds the 20-name cap; pruning proposal goes to the
Sunday weekly review (removals reported before applied).
