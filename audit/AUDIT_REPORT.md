# AUDIT REPORT — v2 System Internal Consistency Review
**Date**: 2026-06-12 · **Auditor role**: institutional risk committee / quantitative auditor
**Scope**: all 10 strategy documents, CLAUDE.md, playbooks, state files
**Verdict (summary)**: The system is structurally sound and unusually disciplined for its size, but it is **not yet fit to manage real capital**. Six P0 defects must be fixed first — most critically an undefined circuit-breaker re-arm (deadlock), a max-drawdown threshold that contradicts the breaker mechanics, and the complete absence of version control/tamper evidence. Full scorecard in §6.

---

## 1. Contradictions Found

| ID | Severity | Finding |
|---|---|---|
| **C1** | Low | STRATEGY_v2 §2: BULL_VOLATILE heat cap is 2.5%, but max satellites (2) × risk (1.0%) = 2.0% — the cap is unreachable. Cosmetic, but caps that can't bind invite sloppy reading. Fix to 2.0%. |
| **C2** | **Critical** | PERFORMANCE_EVALUATION says max drawdown "≤ 10% minimum acceptable." The 8% breaker cannot bound cumulative drawdown at 10%: successive episodes compound across breaker resets. Monte Carlo (10k runs): **median 3y MaxDD 12.2%, p95 19.9%**. The threshold as written will be "breached" in ~70% of 3-year paths even when the system performs exactly as designed. Either the threshold is wrong or the breaker is — they cannot both stand. |
| **C3** | **Critical** | RISK_FRAMEWORK/GOVERNANCE define when the breaker TRIPS but never when it RE-ARMS. Strict reading: equity must recover above 92% of all-time HWM before trading resumes — but it cannot recover without trading. **Deadlock.** First sim pass confirmed: with no re-arm rule, the breaker fires 57×/3y (i.e., permanent halt). The real agent would face exactly this ambiguity and either freeze forever or rationalize a resumption — both unacceptable. |
| **C4** | High | Tempo caps are defined in three places with different units: CLAUDE.md ("2 entries/day, 6 orders/week" — v1 numbers, no regime awareness), v1 RISK_RULES (same), STRATEGY_v2 posture matrix ("4 entries/week" by regime). Worse: **mandated risk-reducing exits (time stops, pre-earnings exits, partial takes) are not exempt** from the order-count cap — the rules can force an exit the tempo cap forbids. |
| **C5** | Medium | GOVERNANCE Art III.6 "No trading with unsettled funds" is stricter than the GFV rule correctly described in FAILURE_MODES #21 (buying with unsettled funds is legal; selling that purchase before settlement is the violation). As written, Art III.6 idles capital ~1 day after every exit. Acceptable if intentional — but the two documents describe different rules. |
| **C6** | Medium | After a breaker trip: PERFORMANCE_EVALUATION gate 2 ("two trips in 6 months → stop pending user-approved revision") and IMPLEMENTATION_ROADMAP §3 (paper gate "after any stop-trading event") and Phase 2 ("first 10 live trades at half risk") all apply, in an undefined order. The resumption pathway needs a single sequenced runbook. |
| **C7** | Medium | CLAUDE.md is not in the precedence chain at all, yet it contains binding rules (anti-churn caps) that now conflict with the regime-dependent v2 caps in BEAR regimes. |

## 2. Circular Dependencies

1. **Breaker deadlock (C3)** — recovery requires trading requires recovery. Confirmed by simulation. The one true circle; must be broken by a re-arm definition.
2. **Self-audit circularity** — the Compliance Auditor is the same model instance (often the same session) that produced the artifacts it audits. It will share the blind spots of what it checks. Not fixable with prompts; fixable with a deterministic guard script that validates orders against machine-readable limits (V3 rec #3).
3. **Paper-gate signal dependency** — gate needs 20 signals; BEAR_CRISIS produces none; paper phase can extend indefinitely. This circle is *safe* (fails toward not trading) — accepted by design, now documented.

## 3. Ambiguous Language & Missing Definitions

| Item | Problem | Required definition |
|---|---|---|
| "equity" | Never pinned to a field | `get_portfolio.total_value` excluding `pending_deposits`, measured at the daily run |
| HWM with cash flows | Deposits inflate HWM math; a $1k deposit at $900 equity reads as +$1000 "gain" | HWM and drawdown on a **deposit-adjusted** basis; performance via time-weighted returns (TWR); every external flow logged in `state/flows.csv` |
| Breaker re-arm | Missing entirely (C3) | See GOVERNANCE_HARDENING §2 proposal |
| ATR14 / RSI(2) | Formula variant unstated | Wilder smoothing for both; close-to-close true range |
| "Session"/timezone | Dates ambiguous | US-market session; all journal/state timestamps in ET with date in `YYYY-MM-DD` ET |
| "Volume contracting into the base" (BO card) | Not operational | 20d avg volume in last third of base < first third |
| "Pullback volume < rally volume" (PB card) | Not operational | mean volume of decline days < mean volume of the preceding up-leg days |
| MR "range" | Undefined bounds | 20-session high/low, ≥ 20 sessions old, height ≥ 3 × ATR14 |
| RS table staleness | Daily entries reference a weekly sector table | Entry gate uses the latest table; if > 7 calendar days old, recompute before nominating |
| "2 parameter changes per quarter" | What is "one change"? | One parameter on one rule = one change; a multi-parameter rule rewrite = ≥ 2 |
| Random journal sampling (monthly audit) | Irreproducible randomness | Seed = YYYYMM integer; deterministic selection |
| Wash-sale tracking | Mentioned, no procedure | Journal records every loss exit; guard script blocks re-buys of a loss-name within 31 days OR tags the trade `wash_sale_flag` for tax records |

## 4. Hidden Assumptions (now explicit)

1. **Broker truth and availability** — positions/orders from the MCP are correct and reachable daily. Partially mitigated (exchange-side stops); reconciliation depends on it entirely.
2. **Single writer** — exactly one agent session runs at a time. NOTHING enforces this. Two concurrent daily runs would race on state and could double-order (ref_id only dedupes retries of the same logical order, not two independently-generated orders). Needs a lockfile.
3. **Faithful execution** — the LLM follows the documents every run. There is no enforcement layer between "rule written" and "order placed." The entire hard-limit system is honor-system at execution time.
4. **Model stability** — behavior is assumed stable across model versions/updates. A model change is an untested deployment of a new trader with the same rulebook.
5. **Honest counterparty** — the user does not game overrides (see GOVERNANCE_HARDENING §4).
6. **Data cleanliness** — historicals are correctly split-adjusted; a bad adjustment silently corrupts every SMA/ATR computed from it. No cross-check exists.

## 5. Rules That Cannot Be Operationalized As Written

- "Bear case written **with equal effort**" — unmeasurable; proxy already half-exists (equal length). Make length the rule.
- "Anything that **smells like a rumor**" — judgment call; acceptable as a flag-and-discard heuristic, cannot be audited.
- "**Crowding**" in the debate — qualitative by design; PM must address it, but no metric exists at this account size. Accepted with eyes open.
- Monthly "scoring-distribution audit to catch grade inflation" — no threshold given. Add one: if monthly mean score of nominations > 85 or < 72, scoring is reviewed.

## 6. Dependency Graph

```
                            GOVERNANCE.md  (apex authority)
                                  │ binds everything below
            ┌─────────────────────┼──────────────────────┐
            ▼                     ▼                      ▼
     RISK_FRAMEWORK.md ◄─── STRATEGY_v2.md        PERFORMANCE_EVALUATION.md
      (limits, sizing)   (regime → posture row)    (gates feed Art IV halts)
            │ regime risk % &  │                         ▲ metrics from
            │ ATR multiple come│                         │
            │ FROM strategy ───┘                         │
            ▼                                            │
     AGENT_ARCHITECTURE.md ──► playbooks/daily-routine ──┤
      (pipeline + vetoes)      playbooks/weekly-review   │
            │ consumes                                   │
            ▼                                            │
     RESEARCH_PROCESS.md ──► journal/* ──► state/account_state.json
      (scores, calendars)         │              state/equity_curve.csv
                                  └──────────────────────┘
     FAILURE_MODES.md ──(read by Compliance role; informs all)
     IMPLEMENTATION_ROADMAP.md ──(phase gates; validates everything before live)
     CHANGELOG.md ◄──(written only via GOVERNANCE Art V)
```
Noted coupling risk: RISK_FRAMEWORK takes its per-regime risk % and ATR
multiple FROM STRATEGY_v2's posture matrix — the risk document depends on a
strategy document for its own binding numbers. Acceptable, but the posture
matrix should be mirrored verbatim into RISK_FRAMEWORK so the risk doc is
self-contained (single-source drift hazard otherwise).

## 7. Precedence Verification

Stated chain: GOVERNANCE → RISK_FRAMEWORK → STRATEGY_v2 → (ARCHITECTURE /
RESEARCH / playbooks) → rest. **Two gaps**: (a) CLAUDE.md sits outside the
chain while containing binding rules (C7) — it must be declared a *pointer
document* whose rules defer to the chain; (b) the third tier is a set of
peer documents with no resolution rule between them — adopt "most
restrictive interpretation wins within a tier," consistent with the
pipeline's deadlock rule.

## 8. State Machine Audit

States: **Phase** {0 build, 1 paper, 2 live-half, 3 live-full, 4 scale} ×
**Breaker** {armed, tripped, cooldown} × **Regime** {BULL_QUIET, BULL_VOLATILE,
RANGE, BEAR_QUIET, BEAR_CRISIS, UNKNOWN} × **Halt flags** (Art IV 1–7).

| Transition | Status |
|---|---|
| Phase 0→1→2→3→4 (gates) | ✅ defined |
| Phase 3→1 (stop-trading event → paper) | ✅ defined (roadmap §3) |
| Phase 1→2 after a demotion: re-enter at 2 (half risk)? | ⚠️ implied, never stated — codify |
| Phase 4→3 (demotion at scale) | ❌ undefined — tier-demotion rule needed |
| Breaker armed→tripped | ✅ defined |
| Breaker tripped→cooldown→**armed** | ❌ **undefined re-arm (C3) — P0** |
| Regime X→Y via 3-close hysteresis | ✅ defined, all 5×5 pairs legal incl. rare BEAR_CRISIS→BULL_QUIET |
| Regime →UNKNOWN (data gap >3 sessions) | ✅ defined (Art IV.7) |
| UNKNOWN→classified | ✅ re-classification on fresh data |
| Halt(Art IV)→resume | ⚠️ defined for breaker (post-mortem+ack+cooldown); **undefined for halts 2,3,4,7** — same resumption protocol should apply, currently unstated |
| Concurrent transitions (breaker trip during regime change) | ⚠️ no ordering rule; adopt: halts process before regime actions |

## 9. Institutional Scorecard (0–100)

| Dimension | Score | Rationale (one line) |
|---|---|---|
| Robustness | 72 | Strong rule redundancy; undermined by C2/C3 and single-source data |
| Risk Control | 84 | Five-layer framework with real numbers; heat/correlation caps genuinely bind |
| Survivability | 88 | Sim risk-of-ruin ≈ 0.01%; posture matrix + cash floors do the work |
| Explainability | 90 | Every trade carries written bull/bear/score/worksheet; best-in-class for size |
| Adaptability | 65 | Regime matrix is good; amendment process is (correctly) slow; long-only is a hard ceiling |
| Operational Discipline | 55 | **No version control, no backups, no enforcement layer, no concurrency control** — the documents are excellent and unprotected |
| Scalability | 75 | Roadmap is realistic; execution/infra upgrades identified at right tiers |
| Resistance to LLM failure modes | 70 | Failure modes named and countered on paper; enforcement is still the same LLM grading itself |
| **Overall** | **74** | Deserves paper trading today; deserves real capital only after the P0 list in V3_RECOMMENDATIONS.md |

**Benchmarked against:**
- **Typical retail trader** (~25/100: no sizing rules, no journal, no stops discipline): this system is categorically better — most of its alpha is simply not doing what retail does.
- **Disciplined systematic swing trader** (~65/100): comparable rules; this system has better documentation and worse tooling (a human's broker enforces some things the LLM only promises).
- **Professional CTA** (~85/100): CTA wins on enforcement (compiled code, not prose), data redundancy, execution infra, and decades of walk-forward. This system matches CTA-grade *governance language* without CTA-grade *plumbing*.
- **Small hedge fund** (~88/100): fund wins on independent risk function (a different human can say no), audited books, disaster recovery, and legal accountability. The gap is institutional independence, not ideas.
