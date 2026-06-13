# CRON WORKFLOW (v6) — The 9:00 AM ET Daily Cycle

## 1. Honest Constraint, Stated First

The AI pipeline needs Claude + the Robinhood MCP + the git repo. A Vercel
serverless function can do none of that well (no MCP session, 10–60 s
limits, no repo). So the architecture splits brains from plumbing:

- **The pipeline runs as a Claude Code scheduled routine** (`/schedule`,
  cloud) or a local scheduled headless run — 9:00 AM ET weekdays. It
  executes DECISION_ENGINE Stages 0–5b/8 (research-through-recommendation;
  NO execution at 9:00), commits artifacts to git, then POSTs everything
  to /api/ingest/*.
- **Vercel cron is the supervisor, never the brain**: watchdog, rollups,
  reconciliation, backups (API_SPEC §5).

## 2. The Daily Timeline (ET)

| Time | Actor | Action |
|---|---|---|
| 9:00 | Pipeline | Stage 0 sync → 1 Market Intelligence → 1b Capital Flow → 3 Opportunity Ranking → 4 Bull/Bear + Risk → 5 Trade Plans → 5b Quality Checks → 8 Final Recommendation (the Section-11 nine steps, in the v4/v5 order) |
| ~9:15 | Pipeline | git commit; POST ingest (run, artifacts, decision, opportunities, positions, signals, agent-runs); trades with cleared plans land as **PENDING_APPROVAL** |
| 9:20 | Vercel watchdog | no ingest? → SystemEvent + alert to operator |
| 9:20–9:30 | **Operator** | review on /approvals: decision, evidence, bull/bear, risk, quality report → APPROVE / REJECT / CHALLENGE (each with note) |
| 9:30+ | Agent (next session or on-poll) | GET /api/agent/pending → for each APPROVED ticket: **Stage-6 pre-execution verification at live prices** (this is why approval ≠ execution: the world may have moved) → execute Stage 7 → POST trade-events (fills, stop confirmation) |
| ~16:10 | Pipeline (close run, optional in paper phase) | position snapshots, equity point, stop/trail updates → ingest |
| 21:30 UTC | Vercel rollup | metrics, calibration resolutions, missed-opportunity scan |
| 02:00/03:00 UTC | Vercel | reconcile · backup |

Approval latency rule: an APPROVED ticket not executed the same session
expires at 15:30 ET (TradeEvent: EXPIRED) — stale approvals are not orders.
A CHALLENGE freezes the ticket until the next pipeline run answers it in a
written artifact.

## 3. Schedule Definitions

- Pipeline (Claude Code scheduled routine): weekdays 9:00 America/New_York
  — DST-correct by timezone definition. Prompt: "Run the daily session per
  playbooks/daily-routine.md; commit artifacts; ingest to the command
  center; do not execute trades in this run."
- Vercel cron (vercel.json) is UTC-only: define watchdog at **13:20 UTC**
  AND **14:20 UTC**, each checking wall-clock ET inside the handler and
  no-oping when it isn't 9:20 ET (the standard DST workaround).
- Market holidays: pipeline checks the exchange calendar at Stage 0 and
  ingests a one-line HOLIDAY run; watchdog treats HOLIDAY as satisfied.

## 4. Failure Modes & Responses

| Failure | Detection | Response |
|---|---|---|
| Pipeline didn't run | 9:20 watchdog | alert; operator can trigger manual run; positions remain protected by exchange-side GTC stops (the standing invariant) |
| Partial ingest (run row, missing artifacts) | ingest completeness check on run finalize | run marked FAILED-PARTIAL; UI shows banner; re-ingest is idempotent |
| Ingest API down | pipeline retry ×3 → continues locally | git still has everything; backfill ingest next session; dashboard shows staleness badge |
| Double run (re-trigger) | idempotency on (date,type) | second run becomes version-2 artifacts, flagged, never silently merged |
| Approval during halted system | /approvals shows halt banner; approve disabled | governance: halts outrank enthusiasm |

## 5. Permanence (Section 11's "store permanently")

Every daily report exists in three places: git (canonical, hash-chained),
Postgres (queryable mirror with sha256), Blob (nightly file copies).
Retention: indefinite, all three. Deletion is not a feature.
