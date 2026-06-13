# EVALUATION ENGINE (v5) — Every AI Output Gets Graded

Principle (industry-standard for production agents): instrument everything,
grade samples continuously, grow a regression set from real failures, and
let outcomes grade the grader. Self-assessment alone is inadmissible.

## 1. The Six Criteria (0–5 each → ×3.33 → 0–100)

| Criterion | 5 (anchor) | 3 | 0–1 |
|---|---|---|---|
| **Accuracy** | every checkable claim verified correct | minor errors, none load-bearing | a load-bearing claim false |
| **Completeness** | all template sections substantive; alternatives considered | gaps in non-critical sections | required sections missing/empty |
| **Consistency** | no internal contradictions; aligns with same-day artifacts | tensions noted but unresolved | contradicts itself or governing docs |
| **Evidence quality** | every claim tagged, Tier 1–2, fresh | mostly tagged, some Tier-3 reliance | untagged claims; Tier-4; from-memory facts |
| **Risk awareness** | failure paths + invalidation explicit and specific | generic risk language | risks absent or dismissed |
| **Actionability** | a reader could act (or verifiably not act) on this alone | needs clarification | vague, hedged into uselessness |

**Pass thresholds**: order-path artifacts ≥ 80 with no criterion < 3;
intelligence/reports ≥ 70. Below threshold → the artifact returns to its
producer (one revision), then dies.

## 2. Per-Output-Type Emphasis

| Output | Weighted criteria | Outcome check (when measurable) |
|---|---|---|
| Market analysis (intel report) | accuracy, evidence, risk | next-session review of §6 invalidation triggers: did flagged risks behave as framed? |
| Trade ideas (nominations/conviction) | evidence, consistency, risk | post-trade: which components predicted outcome (feeds post-mortem Q4/Q5) |
| Risk analysis (worksheets) | accuracy, completeness | guard-script agreement rate (must be 100%) |
| News interpretation | evidence, accuracy | did the "confirmed driver" hold up in 5 sessions? |
| Capital flow analysis | evidence, accuracy | quarterly validation engine (already built for this) |
| Portfolio decisions (PM, session decision) | consistency, risk, actionability | decision-vs-counterfactual review monthly |

## 3. Grading Cadence

1. **At production (self-grade)**: producer scores own artifact — recorded
   but advisory only (calibration data, not a gate).
2. **Weekly sample (independent)**: Evaluator role, fresh-context, re-grades
   3 randomly selected artifacts from the week (seeded RNG: seed = ISO week
   number). Self-grade vs independent-grade gap > 10 points = drift flag.
3. **Outcome grading**: per the table above, when reality resolves a claim.
4. **Quarterly**: full distribution review (means, trends, drift flags),
   calibration report (§4), regression-set update (§5).

## 4. Calibration Ledger

`state/calibration_log.csv` — every resolvable confidence claim:
`date,role,claim_id,confidence,resolvable_by,resolved_date,outcome`.
Quarterly Brier-style review per role. Consequence rule: a role whose
80%-confidence claims resolve true < 60% of the time gets a stated
calibration discount in gates (its "80%" is treated as 65%) until two
consecutive quarters repair it. Confidence becomes a measured input, not
self-reported vibes.

## 5. Regression Set (failures become tests)

`platform/regression/` — every real failure caught by any gate, critic,
audit, or outcome check becomes a numbered case: input artifact (or
synthetic reconstruction), the defect, which gate should catch it. The
quarterly red-team drill (AI_RED_TEAM_FRAMEWORK) replays the FULL set:
every historical failure must still be caught. A case that slips through
again is a sev-1 process regression — halt new entries until diagnosed.
Cases never retire; the set only grows. (Start: empty. First entries will
come from paper-phase mistakes — they are wanted.)

## 6. Honesty Rules

Grades never retro-fit outcomes ("the trade won, so the analysis was a 90").
Process and outcome are graded on separate axes, always — the post-mortem
grade matrix is the model. The Evaluator's own reliability is measured by
the calibration ledger and quarterly sampled re-audit (AGENT_REASONING §3
closure property): the grader is graded by outcomes, the only judge that
cannot be argued with.
