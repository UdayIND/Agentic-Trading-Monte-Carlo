# Session Handoff — 2026-07-03 (holiday; near-miss caught; conditional NVDA order LIVE)

**⚠️ FIRST ACTION MONDAY JUL 6 (any session, ~9:45 ET): check order
6a482004-5b43-4d56-8e3c-8080e173281b (NVDA buy 1 @ stop 198/limit 199.50,
GFD). IF FILLED → place GTC stop_market SELL $183.00 immediately, update
journal + state. If untriggered by close, it expires — reassess Tue with
fresh decision tree. Ratchet plan: +1R $215 → stop $199; +2R $232 → stop
$215. Never widen.**

Watchlist: NVDA + AVGO added (user-directed; best RS on Jul 2 massacre);
RH "Agentic Trading" list pruned to exactly our 16 names.
Tooling: python 3.12.10 available via `py -3.12` (IB-12 closed); 25/25
tests green; guard.py/regime.py runnable — REQUIRED before all future orders.

**v8.1 LONG-TERM PLAN adopted (2026-07-03)**: $500/month contributions.
NEXT DEPOSIT (~Aug 1): verify via get_portfolio → append flows.csv →
CORE BUY QQQ same session (100% to core until core ≥55% of equity —
transitional rule) → journal + commit + push. Core is NEVER sold in
drawdowns; satellite keeps v8 rules. Backtest: backtests/RESULTS_longterm_v1.md
(expect ~75% chance of ≥1 35%-floor touch per decade — protocol, not failure).

- Phase: 2_live_autonomous (v8) — MCP LIVE ✓ · $500 visible but
  **pending_deposits=$500 (ACH not settled — re-verify Monday before sizing)**
- Market: CLOSED today (Jul 4 observed); reopens Mon Jul 6 09:30 ET.
- **Near-miss on record**: SOXL plan cancelled pre-order (self-graded
  Stage-6, market-closed miss, 3x into vol expansion, instrument drift).
  Lessons L1–L3 in journal/LESSONS_LEARNED.md. Stage-6 checks now REQUIRE
  same-session tool/dated-source citations. Deterministic gates mandatory:
  guard.py on saved JSON + regime.py on real bars before ANY order.
- Research: MU deep-dive → conviction 82 TACTICAL (SCA moat 12–18mo; base
  case ~$325 vs $976 — trend must be intact). SNDK → 78, do-not-trade at
  $1,743. Critic pass (fresh context) queued P1 for Monday.
- Tape: two-day semi distribution (Jul 1–2): MU −5.5%, SNDK −14.2%, SOXL
  −16.8% vs SPY flat = leadership break in the crowded trade. Stand-aside
  posture until stabilization.
- **Monday Jul 6 decision tree (pre-committed — runs/2026-07-03/DECISION.md)**:
  regime.py + deposit-settled check + tradability + earnings calendar FIRST;
  Scenario A (MU holds ≥$950, semis stabilize) → SMH starter $100–125,
  stop −8%, ~2% risk; Scenario B (MU <$900 / SMH <50d) → NO ENTRY;
  Scenario C (gap up) → don't chase. Leveraged OFF until vol percentile
  normal. No entries Jul 13–15 (CPI Tue Jul 14, verified BLS) or Jul 27–30
  (FOMC Jul 28–29).
- Robinhood watchlist "Agentic Trading" synced (+11); over 20-name cap due
  to 13 legacy names — prune proposal at Sunday weekly review.
- Pending user items: GitHub push auth still failing (commits local);
  Jira token in ~/.claude/settings.json still needs rotation.
- Last decision: DO_NOTHING 95% (runs/2026-07-03/DECISION.md).
