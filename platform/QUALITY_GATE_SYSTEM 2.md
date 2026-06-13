# QUALITY GATE SYSTEM (v5) — Mandatory Checks Before Any Recommendation

The final gate before a recommendation (trade OR formal session decision)
leaves the system. Produces `QUALITY_CHECK_REPORT.md` in the run directory
(the Part-10 artifact). One failed check = recommendation BLOCKED — it
returns to its producer with the failure named, one revision permitted,
then dead. Blocking is logged; a blocked bad recommendation is a success.

## The Six Checks

| # | Check | Method | Deterministic? |
|---|---|---|---|
| 1 | **Missing evidence** | scan artifact for untagged factual claims (no [tool:]/[file:]/[web:]/[calc:] tag); any market fact without a tag fails | semi (pattern + judgment) |
| 2 | **Unsupported claims** | each tagged claim spot-checked: does the cited source actually say that? sample 100% of order-path claims, ≥ 3 random claims elsewhere | LLM w/ source in hand |
| 3 | **Contradictions** | artifact vs itself; vs same-day artifacts (intel report, regime memo, risk worksheet); vs governing docs. Explicit pairwise pass, listed | LLM (checklist-driven) |
| 4 | **Stale information** | every timestamp vs freshness rules (TOOL_USAGE_GUIDE §5): quotes 15-min, regime same-day, RS table ≤ 7d, web gating-evidence ≤ 5 sessions | deterministic |
| 5 | **Rule violations** | guard script PASS required (sizing, heat, caps, tempo, account, settlement) + halt-flag re-check | deterministic (script) |
| 6 | **Calculation errors** | every number in the recommendation recomputed by script or arithmetic re-derivation; entry/stop/size/R math must reproduce exactly | deterministic |

Until `tools/guard.py` exists (v3 P0 — pending), checks 5–6 run as manual
recomputation with the work shown in the report — slower, weaker, and one
of the reasons live trading stays blocked.

## QUALITY_CHECK_REPORT.md Format

```
# Quality Check — {date} — {subject: TRADE ticker | SESSION DECISION}
| # | Check | Result | Evidence |
|---|---|---|---|
1–6 rows: PASS/FAIL + one-line evidence (what was sampled, what was recomputed)
VERDICT: CLEARED | BLOCKED (check #, reason, returned-to)
Checked artifacts: {paths} · Checker mode: {fresh-subagent | firewall}
```

## Placement in the Pipeline

Runs AFTER the PM approval and BEFORE Stage-6 pre-execution verification
(quality gate = "is the work sound"; Stage 6 = "is the world still as the
work assumed"). For non-trade sessions it runs on the DECISION.md draft.
The checker may not be the artifact's producer (AGENT_REASONING §3); use a
fresh-context pass per the critic rules.

## Failure Telemetry

Every BLOCK appends to `state/quality_blocks.csv`
(`date,subject,check,artifact,producer_role`) and becomes a candidate for
the regression set (EVALUATION_ENGINE §5). Three blocks of the same check
type in a month = systemic producer defect → that role's card or process
gets a written fix proposal at the next review. The gate's job is not just
stopping bad outputs — it's surfacing which part of the factory makes them.
