# BEST PRACTICES INSTALLATION (v5) — Principles Extracted, Mapped, and Tracked

Method: extract publicly known principles (not org imitations) from five
domains; map each to a concrete mechanism in this project; track install
status. Status: ✅ installed · ◐ partial · ⏳ pending (blocked item named).

## 1. From AI Research / Production-Agent Engineering

| Principle | This project's mechanism | Status |
|---|---|---|
| Model is a component, not a source of truth — verify before delivery | tool-grounded evidence tags; quarantine ingestion; quality gates | ✅ |
| Structured outputs constrain hallucination | templates + YAML frontmatter on artifacts; fixed evidence-block schema | ◐ (frontmatter rollout) |
| Actor–critic separation with fresh context | AGENT_REASONING three-pass; subagent critics; no-self-approval matrix | ✅ design / ◐ practice (subagent mode) |
| LLM-as-judge with rubrics + sampled production grading | EVALUATION_ENGINE six criteria, weekly seeded samples | ✅ |
| Calibration measurement (confidence must mean something) | calibration_log.csv + quarterly Brier review + gate discounts | ✅ design (ledger empty — needs data) |
| Regression set grown from real failures | platform/regression/ + quarterly replay | ✅ design (set empty by definition) |
| Instrument everything as structured data | decision_log, quality_blocks, signals ledger, equity curve, run dirs | ✅ |
| Deterministic validators over LLM self-checks for arithmetic | tools/guard.py, regime.py, metrics.py | ⏳ **blocked: v3 P0 #3/#11** |
| Instruction/data separation against injection | evidence-block quarantine; tier system; canary | ✅ |
| Context engineering (working memory ≠ storage) | TOKEN_ARCHITECTURE hierarchy; HANDOFF; bulk-data rule | ✅ |

## 2. From Quantitative Research Organizations

| Principle | Mechanism | Status |
|---|---|---|
| Research/execution separation | PM decides, Execution Agent has zero discretion | ✅ |
| Point-in-time discipline; no look-ahead | backtest protocol (ROADMAP §1) | ✅ |
| Walk-forward over in-sample tuning; parameter-change asceticism | Art V caps; CHANGELOG records rejected variants | ✅ |
| Pre-committed kill criteria | expectancy/benchmark/adherence gates; hard floor | ✅ |
| Decision journals with ex-ante reasoning | trade plans + decision records BEFORE outcomes | ✅ |
| Capacity awareness | scaling plan liquidity rules | ✅ (binding later) |
| Benchmark honesty (vs implementable alternative) | every report pairs returns with QQQ B&H | ✅ |

## 3. From High-Reliability Organizations (aviation, nuclear)

| Principle | Mechanism | Status |
|---|---|---|
| Checklists for irreversible actions | pre-execution 7-point; execution sequence | ✅ |
| Fail closed; ambiguity = stop | missing artifact = gate fails; restrictive-direction rule | ✅ |
| Sterile cockpit (no distractions during critical phases) | no research/tool calls mid-execution (TOOL_USAGE §2) | ✅ |
| Near-miss reporting valued like incidents | violation log records "almost"; blocked recommendations reviewed | ✅ |
| Guard against normalization of deviance | overrides single-use, budgeted, scored; soft-limit grazes counted | ◐ (override budget pending Art V adoption) |
| Redundancy for critical functions | exchange-side stops independent of agent loop | ✅ |
| Drills under realistic conditions | AI_RED_TEAM monthly/quarterly + cold-boot drill | ✅ design |

## 4. From Safety-Critical Software Engineering

| Principle | Mechanism | Status |
|---|---|---|
| Idempotent operations | ref_id discipline; check-before-retry | ✅ |
| State reconciliation against ground truth | Stage-0 broker reconcile | ✅ (derived-value depth pending v3 #18) |
| Immutable, append-only audit logs | CSVs append-only; artifacts amend-by-version | ◐ **tamper evidence blocked: git, v3 P0 #1** |
| Schema validation at boundaries | state schema checks | ⏳ guard work |
| Single-writer concurrency control | run lock | ⏳ **v3 P0 #6** |
| Blameless postmortems focused on process | post-mortem grade matrix (process vs outcome axes) | ✅ |
| Staged rollout with gates | Phases 0–4; half-risk re-entry | ✅ |
| Disaster recovery that is drilled, not assumed | quarterly restore drill | ⏳ needs git first |

## 5. From Institutional Investment Process

| Principle | Mechanism | Status |
|---|---|---|
| IC memo discipline (thesis, risks, sizing, exit — ex ante) | trade plan + bull/bear + conviction report | ✅ |
| Mandated devil's advocate | bear case written-to-kill, fresh-context | ✅ |
| Risk limits independent of conviction | conviction never sizes (Art IX.3) | ✅ |
| Compliance independence | Compliance audits process, can freeze, profitable violations still violations | ✅ |
| Best-execution records | execution records with full call trail | ✅ |
| Performance attribution (skill vs luck vs beta) | post-mortems + alpha-vs-QQQ + luck flags | ✅ |
| "Does this trade beat doing nothing" as the standing question | DO-NOTHING default; vs-cash comparison required | ✅ |

## 6. Installation Debt (the honest list)

Everything marked ⏳ traces to four unbuilt items: **git+remote, guard
script, TWR accounting, run lock** (v3 P0 #1/#3/#4/#6) plus the pending
Art V P1 amendments (override budget, benchmark-gate rolling window,
zombie band). The v5 documents do not reduce this debt — they make its
cost explicit: roughly a third of installed best practice is design-only
until those land. They remain the gate to live capital.

*Grounding sources for the 2026 practice set: [Maxim — hallucination detection/mitigation](https://www.getmaxim.ai/articles/llm-hallucination-detection-and-mitigation-best-techniques/) · [agent evaluation: tools, trajectories, LLM-as-judge](https://medium.com/@vinodkrane/chapter-8-agent-evaluation-for-llms-how-to-test-tools-trajectories-and-llm-as-judge-788f6f3e0d52) · [epistemic stability for industrial LLM use](https://arxiv.org/pdf/2603.10047) · [Lakera — LLM hallucinations 2026](https://www.lakera.ai/blog/guide-to-hallucinations-in-large-language-models) · [MLM — detection beyond prompting](https://machinelearningmastery.com/5-practical-techniques-to-detect-and-mitigate-llm-hallucinations-beyond-prompt-engineering/)*
