# Quarterly Review (first two weekends after quarter end)

Combines RESEARCH_PROCESS §3 (quarterly), GOVERNANCE's quarterly governance
window, the earnings cycle, and the capital-flow validation engine. This is
the ONLY window where parameter-change proposals are considered (Art V,
evidence required; risk-reducing changes exempt as always).

## 1. Earnings season sweep
- `research/templates/EARNINGS_REVIEW.md` for every holding and top-5
  watchlist name that reported.
- Thesis files updated; any pre-registered kill-evidence that appeared goes
  to the decision pipeline, not to a footnote.

## 2. Walk-forward revalidation
Replay the quarter (IMPLEMENTATION_ROADMAP §2): would the rules as written
have produced the trades as taken? Deviations are violations (Compliance
log) or documentation bugs (fix the docs). Both get named.

## 3. Regime & posture audit
Time spent in each regime; was the posture matrix honored? Regime-flip
timeliness: how many sessions late were classifications vs tools/regime.py
ground truth?

## 4. Capital-flow validation engine
Quarterly run per CAPITAL_FLOW_INTELLIGENCE: forward-return verdicts per
source class from state/capital_flow_signals.csv; adjust source classes'
validated/cold-start status. 13F deep pass. No source keeps permanent
trust.

## 5. Performance vs self-termination gates
Full PERFORMANCE_EVALUATION quarterly section including the gates. If a
gate is hit, say so in the first paragraph of the report, not the last.

## 6. Decision-quality review (process, not outcomes)
From state/decision_log.csv: decision mix (how often DO NOTHING — too low
is a churn flag), verification-cancellation rate, challenge-survival rate,
calibration by decision type. Identify the single worst decision *process*
of the quarter and its lesson — independent of P&L.

## 7. Governance window
- IMPROVEMENT_BACKLOG items with evidence → Art V proposals (max 2
  adoptions/quarter). Rejected proposals recorded with reasons in
  CHANGELOG (search history is overfitting control).
- Scaling checkpoint vs IMPLEMENTATION_ROADMAP tiers.
- LESSONS_LEARNED 3×-recurrence escalations resolved: rule change proposal
  or explicit accept-with-reason.

## 8. Research desk audit
- research/QUEUE.md hygiene: throughput, stale items pruned, WIP ≤ 5.
- Sample one completed deep-dive; score it against the six evaluation
  criteria (EVALUATION_ENGINE). Grade drift = retrain the template.

## 9. Close
Written quarterly report: scoreboard vs QQQ (risk-adjusted, TWR), gates
status, violations, calibration, adopted/rejected changes, next quarter's
focus. Update state files and HANDOFF.
