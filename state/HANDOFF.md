# Session Handoff — 2026-07-02 (v7+v8 adoption session)
- Phase: **2_live_autonomous (v8)** — execution GATED on: (1) Robinhood MCP
  reconnect (`claude mcp add robinhood-trading --transport http
  https://agent.robinhood.com/mcp/trading` + /mcp OAuth — endpoint verified
  on robinhood.com support 2026-07-02), (2) verify $500 deposit via
  get_portfolio (user-reported, flows.csv), (3) MU+SNDK deep-dives (QUEUE
  P1), (4) guard.py PASS + Stage-6 on a specific plan.
- v8 = strategy/HIGH_RISK_MANDATE.md: risk/trade 5%, ≤3 positions, single
  ≤40%, heat ≤15%, DD floor 35% → auto-flatten+paper. Autonomous execution
  GRANTED (conditions in §3). First entries: half-size, pullback structure
  preferred over chases; QQQ/SMH fallback.
- Regime: BULL trend (web levels: S&P 7,483 / Nasdaq 26,040 near records);
  vol axis UNKNOWN — run tools/regime.py on MCP bars FIRST market session.
- Equity/cash/heat: $500 (UNVERIFIED) / 100% cash / 0%.
- Watchlist: seeded ×14 (state/watchlist.md — AI memory/compute/optics/DC
  themes; energy deliberately excluded, ceasefire reversal). Mirror to
  Robinhood list when MCP live. ALL earnings dates unverified — check
  before any entry.
- Events: June CPI ~Jul 14 (VERIFY exact date), FOMC Jul 28–29 → no-entry
  windows. Jul 3 half-day/Jul 4 holiday (verify calendar).
- Invalidation triggers: hot June CPI (hike repricing); ceasefire breakdown
  (oil spike); MU/SMH below 50d SMA (leadership break).
- Automation: tools/cron/ scripts + Windows scheduled tasks (9:00 pipeline /
  9:40 execute / Sun 10:00 weekly). Claude CLI installed via winget this
  session. Tasks no-op gracefully if MCP/CLI unavailable.
- Pending user actions: GitHub push auth (commit e9cd134+ local), MCP add +
  OAuth (desktop device required), rotate Jira token in ~/.claude/settings.json
  (plaintext, flagged 2026-07-02).
- Last decision: DO_NOTHING 90% (runs/2026-07-02) — no execution capability
  this session; research+governance session.
