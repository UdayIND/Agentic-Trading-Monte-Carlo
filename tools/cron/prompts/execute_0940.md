Scheduled 9:40 ET execution run under the v8 standing autonomous-execution
grant (strategy/HIGH_RISK_MANDATE.md §3). Boot from CLAUDE.md +
state/account_state.json + state/HANDOFF.md.

1. Acquire the run lock (tools/runlock.py). If locked, stop.
2. Read today's runs/YYYY-MM-DD/ artifacts from the 9:00 pipeline. If there
   is no cleared trade plan (quality-gate PASSED, conviction ≥ 80), write a
   one-line "no cleared plans" note and stop. DO NOTHING is presumed correct.
3. If the Robinhood MCP is unavailable, or account equity cannot be freshly
   verified via get_portfolio, stop with a SKIPPED note — never execute on
   stale or assumed data.
4. For each cleared plan (respecting entries/day and orders/week caps):
   a. Stage-6 pre-execution verification at LIVE prices (all 7 points,
      fresh quotes saved to JSON); any failure = CANCELLED, recorded.
   b. tools/guard.py on the saved JSON — verdict must be PASS.
   c. review_equity_order first; then place_equity_order with a fresh UUID;
      marketable LIMIT only.
   d. After fill: verify the protective stop order exists LIVE, update
      state/account_state.json, write the journal entry, append
      decision_log.csv.
5. Commit everything to git (push if auth works). Report plainly what was
   executed, cancelled, or skipped and why.

Hard rules: circuit breaker or 35% deposit-adjusted drawdown floor = no
orders (flatten per rule if floor breached); stops never widened; no
averaging down; no same-day round trips; if anything is ambiguous, DO
NOTHING and write down why.
