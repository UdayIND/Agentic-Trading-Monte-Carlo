# DASHBOARD SPEC (v6) — Pages, Components, Data Contracts

Design language: institutional terminal, not consumer app. Dense but
scannable; dark theme default; numbers monospaced; every figure carries its
as-of timestamp; staleness badges everywhere (data older than its freshness
rule renders amber). Decision colors: BUY green, SELL red, HOLD blue,
DO NOTHING gray — gray is styled as a *first-class success state*, not an
absence (the system's whole philosophy in one styling decision).

## / — Home (Section 1)
- **Decision banner** (top, full width): today's decision + confidence % +
  one-line reasoning + link to /audit/[today]. PENDING_APPROVAL items pulse.
- **KPI grid** (12 tiles): Regime (+confirmation counter) · Market outlook
  (one line from intel §4) · Risk level (heat % vs regime cap, gauge) ·
  Cash % · Portfolio value · Open positions (n) · Realized P&L · Unrealized
  P&L · Win rate · Profit factor · Max drawdown · Sharpe.
- **vs QQQ strip**: equity vs QQQ B&H sparkline (inception + 90d toggle).
- **System health row**: last ingest, last reconcile, hash chain, halts
  (any unacked SystemEvent renders a red banner above everything).
- Empty states matter: paper phase shows "PAPER" watermark on all P&L.

## /market (Section 2)
Renders the latest intel report (date picker for history). Six-questions
panel first (What/Why/Changed/Matters/Ignored/Invalidate), then section
tabs: Macro · News · Sector Rotation · Breadth · Volatility · Capital Flows
· Insider · Congress · Institutional. **Every conclusion is an
`<Evidence>` component**: claim text + expandable footer (source name,
tier chip, dates, quote, confidence chip: corroborated/single-source/
disputed). Conclusions without evidence blocks cannot render (the component
literally requires the prop — UI as governance).

## /opportunities (Section 3)
Table (sortable): Ticker · Conviction (pre→post chips) · Risk $ · Reward $
· Expected R · Target · Stop · Sector · Catalyst · Status. Filters: sector,
regime-at-scoring, conviction band, market-cap band. Row expand: component
table + inclusion AND exclusion reasons. Band coloring: ≥90 gold, 80–89
green, 70–79 amber (WATCH), <70 gray with strikethrough-free dignity —
rejects are data, not shame. "Why rank 1 over rank 2" panel pinned above
the table whenever a nomination exists.

## /trade/[id] (Section 4)
Header: ticker, status chip, lifecycle progress bar. Tabs:
**Thesis** (plan's thesis + conviction write-up) · **Bull/Bear** (side-by-
side, equal-width columns, PM rebuttal beneath; critic mode badge:
fresh-subagent vs firewall) · **Risk** (worksheet table, guard status) ·
**Plan** (the eleven fields + invalidation conditions + verification
table w/ pass/fail per check) · **Timeline** (TradeEvent feed: Idea →
Critic → Risk → Quality → Submitted → Approved/Rejected/Challenged →
Verified → Executed → Modified → Closed → Post-mortem, each with timestamp
and payload viewer) · **Post-mortem** (when closed: 7 questions + grade
matrix + luck/skill).
Operator action bar (when PENDING_APPROVAL): Approve / Reject (note
required) / Challenge (question textarea → becomes pipeline work item).

## /portfolio (Section 5)
Holdings table: Ticker · Allocation % · Cost basis · Current price (as-of
badge) · P&L $/% · Target · Stop (distance %) · Conviction (at entry → 
current). Each row expands to **"Why we still own this"** — required daily
text from the position snapshot; a position whose latest snapshot lacks it
renders a red MISSING flag (and Compliance hears about it). Aggregates bar:
heat, bucket exposures vs caps, QQQ-equivalent exposure vs 60% cap.

## /performance (Section 6)
Charts (uPlot/Recharts, all with QQQ overlay where sensible): Equity curve
· Drawdown curve (with breaker/floor lines at −8%/−15%) · Monthly returns
heatmap · R-multiple histogram · Win/loss distribution · Portfolio heat
over time. Metrics table by window (MTD/QTD/YTD/12M/inception): CAGR,
Sharpe, Sortino, PF, Expectancy (R), Alpha, Beta, MaxDD — each with its
PERFORMANCE_EVALUATION threshold beside it and a pass/warn/fail chip.
Sample-size honesty: metrics with n < 20 trades render with an
"insufficient n" overlay — the UI refuses premature conclusions.

## /lessons (Section 7)
Filter chips: mistakes · common failures · recurring themes · winning
patterns · losing patterns. Card per lesson: text, count badge (3×+ =
escalated styling), status, linked post-mortems. Sourced from ingest of
LESSONS_LEARNED.md — the AI updates the file; the platform mirrors it.

## /audit + /audit/[date] (Section 8)
Index: calendar/list of runs with decision chips. Per-date page = **the
reconstruction view**: ordered artifact reader (intel → CF → opportunities
→ bull/bear → risk → plan → quality → decision) with: inputs panel (state
at Stage 0, regime, halt flags), every evidence block, every agent pass
(verdict/confidence), the hash-chain verification badge, and the git
commit link. Print stylesheet — an auditor can export the whole day as one
document.

## /agents (Section 9)
Card per role (9): name, role description, last run, last pass/verdict,
confidence, vetoes (count, window), disagreements raised. **Accuracy
column**: calibration hit-rate from resolved CalibrationClaims + (for
critics) kill-rate with "kills that were right" once outcomes resolve.
Drill-in: per-role claim history. A role with calibration discount active
shows the discount badge (its "80%" counts as 65%).

## /capital-flows (Section 10)
Four panels: Insider buys · Insider sells (pattern-qualifying only) ·
Congress (delay badge always visible) · Institutional (as-of quarter
badge). "Most interesting signals" ranked by CFS with verification chips
(5 checks). Effectiveness tab: forward-excess-return tables by source
class and by repeat actor (3/6/12m), straight from validation columns —
including the unflattering rows.

## /improvement (Section 12)
Accuracy panels: prediction (intel invalidation-trigger hit rate) · signal
(CF fwd-excess) · conviction (score band vs realized R correlation) ·
agent (calibration). Missed opportunities: WATCH-band names that
subsequently hit their hypothetical targets (computed by rollup — honest
regret accounting). False positives: TRADABLE+ names that were blocked/
killed/stopped, with which gate caught them. "Improve next" list: top
backlog items ranked by telemetry (quality-block frequency, calibration
gaps), mirrored from IMPROVEMENT_BACKLOG.md.

## /approvals (Section 14 — the operator's morning page)
Queue of PENDING_APPROVAL trades, each as a single screen: decision
summary, conviction pre→post, bull/bear side-by-side, risk worksheet,
quality report, plan — and three buttons. Designed for the 9:20–9:30
window: everything needed to decide, nothing else. Also: unacked system
events requiring HALT_ACK, and challenge-response threads.

## Shared components
`<Evidence>` · `<ConfidenceChip>` (calibration-aware) · `<StalenessBadge>`
· `<ArtifactViewer>` (markdown + frontmatter) · `<DecisionChip>` ·
`<ThresholdMetric>` (value + threshold + pass/fail) · `<HashBadge>` ·
`<PaperWatermark>`.
