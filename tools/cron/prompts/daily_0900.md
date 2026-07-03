Scheduled 9:00 ET daily pipeline run (CRON_WORKFLOW §2). You are the trading
agent; boot from CLAUDE.md + state/account_state.json + state/HANDOFF.md.

1. Stage 0 sync: check exchange calendar — if today is a market holiday,
   write a one-line HOLIDAY note to runs/YYYY-MM-DD/ and stop.
2. Acquire the run lock (tools/runlock.py). If locked, stop.
3. If the Robinhood MCP is unavailable or the deposit is still UNVERIFIED,
   write runs/YYYY-MM-DD/SKIPPED.md explaining exactly what was missing,
   commit, and stop — do not fabricate data.
4. Otherwise run DECISION_ENGINE Stages 0–5b/8 per playbooks/daily-routine.md:
   fresh portfolio/positions/orders/quotes saved to JSON, deterministic
   regime via tools/regime.py, intelligence report, opportunity ranking from
   state/watchlist.md ONLY, bull/bear + risk, trade plans, quality gate,
   final recommendation. Recommendations only — NO order placement in this
   run (execution belongs to the 9:40 run).
5. Record the session decision in state/decision_log.csv, update state files
   and state/HANDOFF.md, git commit all artifacts. Attempt git push; if auth
   fails, note it and continue.

Hard rules: strategy/HIGH_RISK_MANDATE.md §2 parameters; guard.py verdict is
final; DO NOTHING is the default; never fabricate a price or fact.
