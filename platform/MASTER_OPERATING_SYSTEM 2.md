# MASTER OPERATING SYSTEM (v5) — How the Entire Platform Runs
*The single end-to-end manual. A new operator can run the system from this document alone.*

## 1. What This Is

An AI-native decision platform that trades one Robinhood cash account
(**825795594**, "Agentic") under a written constitution. One language model
executes a governed pipeline of role passes with file-based artifacts,
deterministic checks, and human (user) oversight at defined points. Its
defining preference: **DO NOTHING beats low-confidence action.** It is
built to prove, for every decision ever made: what happened, why, on what
evidence, under which assumptions, and why the final call was reached.

**Current status**: Phase 1 (paper). $0 deposited. Live trading BLOCKED
until: $1,000 deposit + paper gate passed + four P0 items built (git+remote,
guard script, TWR accounting, run lock — `audit/V3_RECOMMENDATIONS.md`).

## 2. Authority Order (when documents disagree)

GOVERNANCE.md → RISK_FRAMEWORK.md → STRATEGY_v2.md → DECISION_ENGINE.md →
platform/ docs → playbooks/templates. Within a tier: the most restrictive
reading wins. CLAUDE.md is a pointer, not an authority. The broker's
records outrank every local file for positions/orders/cash.

## 3. The Map

| Layer | Files | One-line purpose |
|---|---|---|
| Constitution | strategy/GOVERNANCE.md | what may never happen; halts; amendments; overrides |
| Risk | strategy/RISK_FRAMEWORK.md (+ v1 cards) | 5-layer limits, sizing formula, heat, breaker + 15% floor |
| Strategy | strategy/STRATEGY_v2.md | regimes, posture matrix, sector rotation, 4 playbooks |
| Decision engine | strategy/DECISION_ENGINE.md, CONVICTION_FRAMEWORK.md, CAPITAL_FLOW_INTELLIGENCE.md | session pipeline; the ≥80 gate; capital-flow evidence |
| AI platform | platform/*.md (8 docs) | prompts, reasoning protocol, tools, tokens, evaluation, quality gates, red team, learning loop |
| Operations | playbooks/, templates in intelligence/ + trades/ | how each session actually runs |
| State | state/*.json|csv|md | account state, decision/quality/calibration/signal logs, equity curve, HANDOFF |
| Records | runs/YYYY-MM-DD/, journal/, trades/, strategy/CHANGELOG.md | the audit trail |
| Validation | audit/, backtests/, platform/regression/, drills/ | proof the system deserves capital |

## 4. Running a Day (operator instructions)

1. Open Claude Code in this project directory. Say: **"Run the daily
   session."** (CLAUDE.md auto-loads; the agent boots from
   state/account_state.json + state/HANDOFF.md — no memory of prior chats
   is needed or trusted.)
2. The agent executes Stages 0–9 (DECISION_ENGINE): sync/guard → market
   intelligence → position management → opportunity ranking → challenge →
   trade plan → quality gate → verification → (execution) → decision record
   → handoff. Artifacts appear in `runs/{today}/`.
3. You receive one report: the session decision (BUY/SELL/HOLD/DO NOTHING
   + confidence + reasoning + invalidation), equity, and what was
   deliberately NOT done. Most days: DO NOTHING. That is the system working.
4. Weekly (weekend): "Run the weekly review." Monthly/quarterly runs are
   listed in RESEARCH_PROCESS §2–3 and CONTINUOUS_IMPROVEMENT_ENGINE §1.

**What needs YOU**: deposits; Art V amendment approvals; halt resumptions
(post-mortem acknowledgment); overrides (sparingly — they're budgeted and
scored); quarterly review sign-offs. The agent must never be the only one
who knows the system halted — alerts are part of its job.

## 5. How a Trade Happens (the only path — Part-10 standard)

Nine artifacts, in order, all on disk before any order:
1. MARKET_INTELLIGENCE_REPORT.md (session context; six questions answered)
2. CAPITAL_FLOW_REPORT (CF summary + per-name CFS, within intel report or standalone)
3. CONVICTION_REPORT (scored components + evidence; ≥ 80 post-challenge — inside TOP_OPPORTUNITIES + plan)
4. RISK_REPORT (heat worksheet, all five layers, guard PASS)
5. BULL_CASE.md and 6. BEAR_CASE.md (fresh-context bear; PM rebuts in writing)
7. TRADE_PLAN_[ticker].md (the eleven fields + invalidation + verification table)
8. QUALITY_CHECK_REPORT.md (six checks; any fail = blocked)
9. FINAL_DECISION (DECISION.md — the session record)
Then: 7-point pre-execution verification at live prices → execution
sequence → stop verified live → journal. Any missing artifact fails the
chain closed. **No recommendation may bypass this. There is no fast path.**

## 6. How the AI Polices Itself

Three-pass reasoning on order-path work (primary → fresh-context critic →
final; no self-approval — AGENT_REASONING_PROTOCOL) · evidence tags on
every factual claim, quarantined web ingestion (TOOL_USAGE_GUIDE) ·
deterministic scripts for all money-math (pending build; manual
recomputation with shown work until then) · graded outputs + calibration
ledger (EVALUATION_ENGINE) · monthly self-attack drills + regression replay
(AI_RED_TEAM_FRAMEWORK) · four-questions learning loop at five horizons
(CONTINUOUS_IMPROVEMENT_ENGINE).

## 7. When Things Go Wrong (operator quick reference)

| Event | What happens | What you do |
|---|---|---|
| −8% from anchor | breaker: satellites flattened, 5-session cooldown, post-mortem | read post-mortem, acknowledge to resume (half-risk re-entry) |
| −15% from all-time HWM | hard floor: everything closed, back to paper | full paper gate + your written re-authorization |
| Data/state integrity failure | trading halts, reconciliation runbook | review the diff report, acknowledge |
| Tool outage | fail-closed; positions protected by exchange-side GTC stops | monitor via Robinhood app if prolonged |
| Quality gate blocks a trade | logged, producer revises once or it dies | nothing — that's normal operation |
| Agent asks to override a rule | it can't — only YOU can override (Art VII; budgeted, scored, recorded with dissent) | decide, in writing, sparingly |

## 8. The Audit Promise (how to reconstruct any decision)

For decision D on date X: open `runs/X/` — DECISION.md names the artifacts;
the intelligence report gives the world-state; conviction + bull/bear give
the reasoning and its challenge; the risk report and quality check give the
controls; the plan gives the ex-ante terms; the journal + post-mortem give
the outcome and its honest grading; decision_log.csv indexes everything;
CHANGELOG.md tells you which rules were in force. Evidence tags trace every
fact to a tool call, file, source, or script. If any link in that chain is
missing, the decision should not have happened — and the Compliance log
will say so.

## 9. Prime Directive (verbatim, the last word)

Avoid catastrophic loss. Preserve capital. Beat QQQ risk-adjusted. Generate
returns. In that order. When in doubt: DO NOTHING, write down why, and let
the evidence — not the urge — make the next call.
