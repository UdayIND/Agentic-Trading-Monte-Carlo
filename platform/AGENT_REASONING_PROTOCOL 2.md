# AGENT REASONING PROTOCOL (v5) — Three-Pass Reasoning, No Self-Approval

Applies to all nine roles: Regime Analyst, Macro, Technical, Capital Flow,
Risk, Portfolio, Execution, Compliance, Evaluator.

## 1. The Three Passes

**PRIMARY ANALYSIS** — the role card runs (PROMPT_LIBRARY), producing a
self-contained artifact on disk: evidence-tagged, assumptions logged,
confidence stated. *Self-contained* means a reader with only the artifact +
governing docs can evaluate it — no reliance on conversation context. This
is what makes independent criticism possible.

**CRITIC PASS** — a fresh-context critic (PROMPT_LIBRARY §3) attacks the
artifact. Independence requirement, in order of preference:
1. **Subagent** with fresh context (when running under Claude Code with the
   Agent tool): the critic receives ONLY the artifact paths + verdict
   format. Preferred for: bear case, risic-grade reviews, sampled evaluation.
2. **Context firewall** (fallback, same session): the critic step may read
   only the artifact from disk — re-read it via the file tool even though
   "remembered" — and must write the critique before any rebuttal thinking.
   Weaker than (1); flagged as `critic_mode: firewall` in the artifact.
Critic verdict: KILL / REVISE (itemized) / SURVIVES (+ 2 weakest points).

**FINAL PASS** — the original role (or its superior gate) addresses the
critique: every KILL/REVISE item answered with evidence or accepted with
changes. Unanswered item = work is dead. The final artifact records all
three passes (primary → critique → resolution) with the post-critique
confidence, which may only move DOWN or stay equal unless new evidence
was added (anti-rationalization rule).

## 2. Proportionality (anti-bureaucracy)

| Work product | Critic requirement |
|---|---|
| Order-path artifacts (nomination, conviction, plan) | Full three-pass, every time |
| Intelligence report | Critic pass on §§1–6 conclusions weekly + whenever it gates a trade that day |
| Regime memo | Deterministic (script) — critic only on override attempts |
| Routine journaling, state updates | Compliance audit only |
| Weekly/quarterly reports | Three-pass on conclusions, not on data tables |

## 3. No-Self-Approval Matrix

| Producer | Who must pass it |
|---|---|
| Technical Analyst nomination | Critic (fresh) → Risk → PM |
| Capital Flow modifier | 5-check verification (deterministic) + Compliance sample |
| Bull case | Bear critic (fresh-context, mandatory) |
| Risk worksheet | Guard script (deterministic) — code checks the human-style pass |
| PM approval | Compliance post-check + pre-execution verification |
| Execution record | Compliance reconciliation vs broker truth |
| Compliance audit | Quarterly sampled re-audit by fresh-context Evaluator |
| Evaluator grades | Calibration log (outcomes grade the grader) |
| Macro calendar | Two-source rule (data checks the analyst) |

Closure property: every role's output is checked by a different role, a
deterministic script, or measured outcomes — including the checkers.

## 4. Structured Disagreement Resolution

1. Critic vs producer: producer must answer every item; the gate above them
   (PM for analysis, Compliance for process) reads both sides. Unresolved →
   restrictive direction wins (no trade, lower score, smaller claim).
2. Two artifacts contradict (e.g., intel report says no-entry day; PM wants
   in): restrictive wins, always, no escalation path within a session.
3. Model vs script: script wins on arithmetic; model may flag a SUSPECTED
   script bug, which halts the trade AND files the bug — it never "works
   around" the script.
4. Today vs yesterday's artifacts: new evidence may revise views, but the
   revision must cite what changed; "I now feel differently" is not a delta.

## 5. Confidence Calibration (shared scale, all roles)

| % | Meaning | Usage discipline |
|---|---|---|
| 50–60 | barely better than chance | never sufficient for action alone |
| 60–75 | evidence leans, contradictions remain | watchlist-grade |
| 75–90 | strong multi-source evidence, survived critique | action-grade (with all gates) |
| 90+ | near-mechanical (rule-mandated actions, verified fills) | reserved; analyst conclusions almost never qualify |

Every stated confidence is logged (state/calibration_log.csv:
`date,role,claim_id,confidence,resolvable_by,resolved_date,outcome`) when
the claim is resolvable. Quarterly: Brier-style review — roles whose 80%
claims hit 50% get their effective confidence discounted in gates until
recalibrated. Confidence is a measured property here, not a mood.

## 6. Assumption Logging

Every artifact carries a numbered ASSUMPTIONS block (what is believed
without this-session evidence, and how each could be wrong). Pre-execution
verification re-tests the trade's assumptions, by number. An assumption
that silently became load-bearing without listing is a Compliance finding.
