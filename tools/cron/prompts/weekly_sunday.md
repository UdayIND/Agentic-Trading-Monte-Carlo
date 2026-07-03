Scheduled Sunday 10:00 ET weekly review. Boot from CLAUDE.md +
state/account_state.json + state/HANDOFF.md.

Run playbooks/weekly-review.md in full: scoreboard vs QQQ (honest, both
directions), closed-trades audit (process-correct vs process-wrong), rule
adherence, regime + watchlist refresh (state/watchlist.md is the source of
truth; max 2 adds; every change journaled; mirror to the Robinhood list via
MCP when available), state-file resets (weekly_order_count etc.), strategy
feedback loop.

Also: earnings-calendar sweep for every watchlist name (next 3 weeks,
verified dates → earnings_within_10d tags); macro calendar for the next 2
weeks (no-entry windows); research/QUEUE.md hygiene (WIP ≤ 5, prune stale).

If the first weekend of the month, also run playbooks/monthly-risk-review.md.

Write the weekly report to runs/YYYY-MM-DD/, update state/HANDOFF.md, git
commit (push if auth works). Never fabricate data; anything unverifiable is
labeled or excluded.
