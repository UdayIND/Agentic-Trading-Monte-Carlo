# Monthly Risk Review (first weekend of the month)

Operationalizes RESEARCH_PROCESS §3 (monthly) + CIO_MANDATE portfolio
intelligence. Output: one written report; artifacts to
`research/portfolio/` and `research/macro/`. Numbers first.

## 1. Metric pack
Run tools/metrics.py; compare the full pack to PERFORMANCE_EVALUATION
thresholds. Expectancy by playbook and by regime. Flag any threshold breach
plainly — thresholds exist to be believed, not explained away.

## 2. Portfolio intelligence
Complete `research/templates/PORTFOLIO_REVIEW.md` in full (allocation,
concentration, correlation, risk metrics, liquidity, tax, the ignored
risk). Fresh tool data only.

## 3. Macro structure
Complete `research/templates/MACRO_REVIEW.md` (growth, inflation/policy,
labor, credit, cycle placement). Check agreement with tools/regime.py's
classification; investigate disagreement — don't average it away.

## 4. Strategy-drift audit
Sample 5 random journal entries; re-verify each trade matched its playbook
card at entry. Deviations → Compliance log as violation or doc bug.

## 5. Adherence & calibration
- Rule violations this month (target: zero) — list plainly.
- Conviction calibration: stated confidence vs outcomes from
  state/calibration_log.csv (EVALUATION_ENGINE scoring). Persistent
  overconfidence = tighten the scale, not the excuses.
- Opportunity-score distribution check (grade-inflation audit,
  RESEARCH_PROCESS §4).
- Quality-gate blocks review (state/quality_blocks.csv): what got blocked
  and was the block correct?

## 6. Universe health
Re-check liquidity floors and price-band fit of every watchlist name at
current equity (RESEARCH_PROCESS §3).

## 7. Red-team drill
Run the monthly self-attack per AI_RED_TEAM_FRAMEWORK (COPY environment
only); log results and any new regression cases.

## 8. Improvement pipeline
Sweep the month's LESSONS_LEARNED + post-mortems for recurrences (3× =
quarterly-review escalation). New proposals → journal/IMPROVEMENT_BACKLOG
with measurable expected effect. Adoption still gated by Art V.

## 9. Close
Update state (last review dates); one-message summary to the user: metric
pack vs thresholds, violations, calibration verdict, top risk, any
proposals. No spin.
