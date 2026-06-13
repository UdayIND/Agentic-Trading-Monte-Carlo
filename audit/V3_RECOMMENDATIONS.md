# V3 RECOMMENDATIONS — Hardening Only, No New Alpha
**Date**: 2026-06-12 · **Constraint honored**: every item below reduces risk, increases reliability, or improves auditability/reproducibility/governance/resilience. Nothing here seeks return. Items marked (Art V) require user approval as governance amendments; the rest are operational and risk-reducing (adoptable immediately per Art V's "emergency risk reductions never need approval to reduce risk" — but all are listed for transparency).

Impact: ▲▲▲ critical / ▲▲ high / ▲ meaningful. Effort: S < 1 hr · M < 1 day · L multi-day.

---

## P0 — Before any live order (blocking)

| # | Recommendation | Impact | Effort | Closes |
|---|---|---|---|---|
| 1 | **Version control + remote backup.** `git init`, commit every run, private remote, weekly push, quarterly restore drill. | ▲▲▲ | S | Red-team #17, #18; audit "no integrity layer"; disaster recovery |
| 2 | **Complete the circuit breaker** (Art V): re-arm at resumption equity; 15% cumulative deposit-adjusted hard floor that flattens *everything including core* and reverts to paper; restated honest DD envelope (8–10% per episode, 15% bounded cumulative). | ▲▲▲ | S (text) | Audit C2, C3 (deadlock — sim-confirmed); core-uncovered-in-crash gap |
| 3 | **Deterministic pre-trade guard script** (`tools/guard.py`, spec in OPERATIONAL_READINESS §5): all order-path arithmetic and limit checks move from LLM prose to code; no PASS → no order (Art V for the constitutional hook). | ▲▲▲ | M | Red-team #8, #9, #11, #12, #15 — the five worst vectors; self-audit circularity |
| 4 | **Deposit-adjusted accounting**: `state/flows.csv`, TWR returns, flow-adjusted HWM/drawdown; "equity" pinned to a named portfolio field. | ▲▲▲ | S | Audit missing-definition (HWM); every gate currently distortable by a deposit |
| 5 | **Tempo-cap unification** (Art V): single definition in RISK_FRAMEWORK (regime-dependent entry caps; total-order caps); **risk-reducing orders (stops, protective exits, partial takes, mandated exits) always exempt**; CLAUDE.md demoted to pointer-only. | ▲▲ | S | Audit C4, C7 (rules can currently forbid a mandated exit) |
| 6 | **Single-writer lock**: `run_in_progress` lock with 2h takeover; `pending_stop` marker written before entry orders (crash-window recovery). | ▲▲ | S | Red-team #11 (concurrent duplicate orders); OPERATIONAL_READINESS §4.4 |

## P1 — First month of live operation

| # | Recommendation | Impact | Effort | Closes |
|---|---|---|---|---|
| 7 | **Override budget** (Art V): max 2/month; none while DD > 5%; monthly override-vs-counterfactual scoreboard. | ▲▲ | S | Red-team #13; hardening §3.4 |
| 8 | **Benchmark gate → rolling windows** (Art V): rolling-12m check each quarter; trailing on return AND MaxDD in 3 of 4 checks ⇒ mandatory index recommendation, re-issued monthly. | ▲▲ | S | Hardening §3.2 (consecutive-month reset gaming) |
| 9 | **Zombie-band fix** (Art V): rolling 60-trade expectancy < +0.10R ⇒ Phase 2; two consecutive windows ⇒ paper. Plus gate-cycling rule: 3 demotions/24mo ⇒ mandatory revision. | ▲▲ | S | Hardening §3.1, §3.3 |
| 10 | **Artifacts-to-disk gating**: each pipeline gate reads its input artifact from a file written this run; missing file = gate fails closed. Run artifacts under `runs/YYYY-MM-DD/`. | ▲▲ | M | Red-team #16 (context summarization mid-pipeline) |
| 11 | **Metrics by script** (`tools/metrics.py`): machine-readable journal frontmatter; the full PERFORMANCE_EVALUATION pack computed from CSV + frontmatter; narratives may interpret, never produce, numbers. | ▲▲ | M | Hardening §3.6; red-team #18 |
| 12 | **Data sanity layer**: quote-vs-last-bar 10% band (split/adjustment faults); two named sources for any calendar date that gates a trade; research-source allowlist; never fetch URLs found inside fetched content. | ▲▲ | S | Red-team #14, #15; hidden assumption "data cleanliness" |
| 13 | **Failure notifications**: push alert to user on breaker, hard floor, failed/missed run, reconciliation mismatch (a halted system that nobody notices is hardening §3.7's paralysis path). | ▲ | S | Red-team #7; hardening §3.7 |
| 14 | **Resumption runbook** (Art V): the single sequenced path from GOVERNANCE_HARDENING §4 merged into GOVERNANCE.md. | ▲▲ | S | Audit C6; undefined Art IV resumptions |

## P2 — First quarter

| # | Recommendation | Impact | Effort | Closes |
|---|---|---|---|---|
| 15 | **Definitions appendix** in RISK_FRAMEWORK: ATR/RSI formulas (Wilder), session/timezone, "one parameter change", MR range bounds, volume-contraction formulas, seeded audit sampling (seed = YYYYMM). | ▲ | S | Audit §3 ambiguity table |
| 16 | **Posture matrix mirrored into RISK_FRAMEWORK** (single-source-of-truth with checksum note), fixing the 2.5%→2.0% BULL_VOLATILE cap while at it (Art V). | ▲ | S | Audit C1; dependency-graph coupling note |
| 17 | **Model-version protocol**: record model ID in every run header; on model change, one week of paper-shadow runs comparing decisions before resuming live. | ▲▲ | S | Hidden assumption #4 — a model upgrade is an untested redeployment |
| 18 | **Reconciliation depth**: extend daily reconcile to derived values (HWM vs flow-adjusted equity history, counts vs journal) not just positions. | ▲ | M | Red-team #10 (silent derived-state corruption) |
| 19 | **Wash-sale ledger**: every loss exit recorded with a 31-day re-entry tag; guard enforces or flags. | ▲ | S | Audit missing-definition; scaling-plan tax debt |
| 20 | **GFV rule reconciliation** (Art V): align Art III.6 with the accurate FAILURE_MODES #21 description — keep the stricter behavior deliberately, but state it as a choice, OR relax to the legal rule with guard enforcement. | ▲ | S | Audit C5 |

## Explicitly Rejected (considered, declined — with reasons)

- **Intraday monitoring/faster loops** — more decisions = more LLM surface;
  exchange-side stops already cover the intraday gap. Rejected as
  risk-increasing.
- **Options hedging (puts/collars)** — new instrument class, new failure
  modes, premium bleed at $1k scale; cash floors achieve the same convexity
  cheaper. Reconsider at $25k+, through Art V, with its own validation.
- **Multiple data vendors** — at this scale the broker feed + sanity bands
  suffice; a second feed adds reconciliation complexity now. Becomes a real
  requirement at $100k (already in the roadmap).
- **Automated self-amendment** — letting the system tune its own parameters
  from live results is overfitting with a feedback loop. The human stays in
  the amendment path permanently.

## Sequencing

Week 0 (now, in paper): #1, #4, #5, #6 — then paper trading continues under
v3 plumbing so the paper gate validates the REAL operational stack, not a
simplified one. Weeks 1–2: #2, #14 (user approvals), #3 built and tested
against synthetic tickets. Then the paper gate clock runs. Items #7–#14
land during paper. P2 lands before Phase 3 (live-full). **The paper gate
must pass on v3 infrastructure** — passing on v2 then upgrading would
validate a system that no longer exists.
