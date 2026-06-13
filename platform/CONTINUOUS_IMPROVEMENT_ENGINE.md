# CONTINUOUS IMPROVEMENT ENGINE (v5) — The Learning Loop

The four questions, asked at every horizon, with evidence:
**What was correct? What was incorrect? What was missing? What should improve?**
Plus the standing fifth: what was luck and what was skill?

## 1. The Loop by Horizon

| Horizon | Trigger | Reflection scope | Output |
|---|---|---|---|
| **Trade** | every close | post-mortem template (the 7 questions + grade matrix) | POST_MORTEM file → LESSONS_LEARNED |
| **Day** | every session | 4 questions, 4 lines max, inside DECISION.md; check yesterday's invalidation triggers — were they right to watch? | DECISION.md reflection block |
| **Week** | weekly review | intel-report claims vs what happened; eval-sample grades; near-misses; blocked recommendations reviewed (was blocking right?) | weekly report §; LESSONS count bumps |
| **Month** | metric pack | expectancy by playbook/regime; quality-block telemetry; calibration drift flags; override scoreboard | improvement candidates → backlog |
| **Quarter** | quarterly review | validation engine verdicts; full calibration report; red-team results; walk-forward; escalated (3×) lessons | Art V amendment proposals |

## 2. Lesson Lifecycle (extends LESSONS_LEARNED.md rules)

observed → counted (recurrence) → **escalated at 3×** (quarterly agenda,
mandatory) → either adopted as a rule (Art V, changelogged, lesson marked
`rule-adopted`) or explicitly rejected with reasons → archived if it stops
predicting anything for 6 months. Anti-noise: one concrete, testable
improvement per reflection MAXIMUM; "no lesson" is a valid and common
answer; lessons must be falsifiable ("we underweight gap risk in
BULL_VOLATILE" yes; "be more careful" no).

## 3. Improvement Backlog

`journal/IMPROVEMENT_BACKLOG.md` — every improvement candidate from any
horizon: `id · date · source (post-mortem/eval/red-team/block telemetry) ·
proposal · expected effect · status (proposed/testing/adopted/rejected)`.
Rules: nothing goes from idea to rule without passing through the backlog
and Art V; max 2 adoptions/quarter (existing change-control cap); rejected
items keep their reasons (the search history is overfitting control —
same doctrine as CHANGELOG).

## 4. What This Engine May NOT Do

- Change rules mid-quarter outside Art V's exceptions.
- Tune parameters because of a drawdown (motivated-reasoning ban stands).
- Treat a small sample as a lesson (n requirements from PERFORMANCE_EVALUATION
  govern; 3 trades prove nothing and the engine says so).
- Learn from outcomes alone: process-wrong wins generate lessons AGAINST
  the process that produced them, not in favor.

## 5. The Meta-Loop (improving the improver)

Quarterly: did adopted improvements deliver their expected effect (each
adoption states one measurable expectation at adoption time)? Two
consecutive adoptions that did nothing = the improvement process itself
gets reviewed. The engine is subject to its own four questions.
