# AI ARCHITECTURE REVIEW (v5) — Every AI Interaction, Audited
**Date**: 2026-06-12 · **Honest framing**: this platform is ONE language model (currently Claude, model recorded per run) operating in one session with MCP tools and a file system. "Agents" are procedural role passes; separation is enforced by artifacts and gates, optionally by fresh-context subagents. Every claim below follows from that reality, not from an imagined multi-process system.

## 1. Inventory of AI Interactions

| # | Interaction | Inputs | Outputs | Context needs | State touched | Tools | Dominant failure mode |
|---|---|---|---|---|---|---|---|
| 1 | Regime classification | QQQ/SPY bars (1y) | regime memo | low | account_state.regime | historicals | **arithmetic in prose** (RV percentile, SMA) |
| 2 | Macro/news research | WebSearch/Fetch | macro memo, intel report §§ | medium | none | web | hallucinated citation, injection, stale/unverified dates |
| 3 | Intelligence synthesis | memos + quotes | MARKET_INTELLIGENCE_REPORT | high | last_intelligence_report | quotes, web | narrative invention beyond evidence; unexplained-move "explanations" |
| 4 | Capital-flow scan | EDGAR/trackers | CF summary, ledger rows | medium | capital_flow_signals.csv | web | fake/misread filings; transaction-code errors |
| 5 | Conviction scoring | bars, quotes, RS table, CF | component scores + prose | high | conviction_watchlist | quotes, historicals | grade inflation; unevidenced components; arithmetic |
| 6 | Bull/bear challenge | score artifact | case files + rebuttal | medium | none | none | **self-agreement** (critic shares author's context) |
| 7 | Risk worksheet | portfolio, state, ticket | pass/fail + size | low | none | portfolio, positions | arithmetic; stale heat; missed caps |
| 8 | Trade plan + verification | all above + fresh quotes | plan, 7-point check | medium | trades/ | quotes, tradability | stale-data approval; skipped checks under "flow" |
| 9 | Order execution | approved ticket | orders + confirmations | low | journal, state | review/place/orders | duplicates, partial-fill mishandling, wrong-field copy |
| 10 | Journaling/decision record | session artifacts | DECISION.md, logs | medium | decision_log, equity_curve | none | optimistic narration; metric self-grading |
| 11 | Post-mortem/lessons | journal, prices | post-mortem, lessons | medium | LESSONS_LEARNED | historicals | hindsight bias; manufactured insight |
| 12 | Weekly/quarterly analytics | ledgers, curves | reports, validation verdicts | high | several | historicals, web | computation at scale in prose; survivorship in retro-analysis |

## 2. Risk Findings (ranked)

**R1 — Arithmetic in prose (CRITICAL, recurring).** Interactions 1, 5, 7, 12
compute load-bearing numbers in-context. Already flagged by the v2 audit
(red-team #9); v5 makes it architectural: **every number that gates money is
computed by code** (`tools/` scripts), the model only interprets. Status:
guard/metrics/regime scripts still pending (v3 P0 #3, #11) — the single
largest gap between design and implementation.

**R2 — Critic non-independence (HIGH).** The bear case, risk pass, and
compliance audit run in the same context that produced the bull case; shared
context biases toward agreement. Fix: AGENT_REASONING_PROTOCOL §3 — critics
read ONLY the disk artifact (which must be self-contained), run with fresh
context (subagent when available, context-firewall procedure otherwise), and
are graded on kill-rate plausibility (a critic that never kills is broken).

**R3 — Injection surface (HIGH).** Web research (2, 4) ingests adversarial
text. Existing rules (input-not-instruction, named sources) are policies the
same model must remember under pressure. Fix: TOOL_USAGE_GUIDE source
tiers + structural quarantine — web content is summarized into a
fixed-schema evidence block (claim, source, date, quote ≤ 25 words) at
ingestion; downstream stages only ever see the evidence blocks, never raw
page text.

**R4 — Context loss / compaction (HIGH, will happen).** Long sessions get
summarized; "memory" of a passed gate is not evidence. v4 artifacts-to-disk
is the right defense; v5 completes it: gates re-READ artifacts (not recall
them), and every session ends with a SESSION_HANDOFF block
(TOKEN_ARCHITECTURE §4) so the next session needs zero conversational
memory. Conversation = scratchpad; disk = truth.

**R5 — State corruption (MEDIUM).** JSON edited by the model with no schema
check; counts/HWM drift invisibly. Fix: schema + range validation on every
read (pending guard work), git history for diffability (pending P0 #1).

**R6 — Tool misuse (MEDIUM).** Wrong account, duplicate orders, dollar vs
shares confusion. Existing: hard-coded account, ref_id, review-first.
Gap: enforcement is procedural. Guard script closes it.

**R7 — Token waste (MEDIUM, reliability not just cost).** Observed: full
1-year bar dumps pulled into context per session (interaction 1 fetched
~250 bars to estimate one percentile); 16-name quote batches when 5 names
matter; verbose artifacts duplicating tool output. Waste isn't only cost —
bloated context displaces instructions and raises error rates. Fixes in
TOKEN_ARCHITECTURE: scripts consume bulk data out-of-context; artifacts
carry extracted numbers, never raw dumps; context budget per stage.

**R8 — Self-graded performance (MEDIUM).** Interactions 10–12 let the
author grade the work. Fix: EVALUATION_ENGINE sampling re-grades +
script-computed metrics + calibration log (confidence vs outcome).

## 3. What Is Already Sound (do not churn)

Artifact-gated pipeline (fail-closed) · default-NO-TRADE with restrictive
tie-breaking · exchange-side stops (protection survives AI failure) ·
bounded capital-flow evidence with revocable trust · changelog/Art V change
control · honest-reporting articles · the decision log. These match or
exceed 2026 production-agent practice; v5 builds on them rather than
replacing them.

## 4. Redesign Verdicts

| Area | Verdict |
|---|---|
| Pipeline topology | KEEP (artifact-gated sequential passes) |
| Numeric computation | **REDESIGN** → deterministic script layer (R1) |
| Critic execution | **REDESIGN** → fresh-context critics (R2) |
| Web ingestion | **REDESIGN** → schema-quarantined evidence blocks (R3) |
| Session continuity | UPGRADE → handoff blocks + disk-truth doctrine (R4) |
| Artifact format | UPGRADE → YAML frontmatter on all artifacts (machine-checkable) |
| Output grading | NEW → EVALUATION_ENGINE + calibration log (R8) |
| Self-testing | NEW → AI_RED_TEAM_FRAMEWORK drills |
