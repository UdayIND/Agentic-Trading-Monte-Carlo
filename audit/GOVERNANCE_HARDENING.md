# GOVERNANCE HARDENING — Closing the Paths Where Failure Persists
**Date**: 2026-06-12 · **Question asked**: is there any path where poor performance, rule erosion, or paralysis continues indefinitely? **Answer: yes — seven. All closeable.**

---

## 1. Evaluation of Existing Mechanisms

| Mechanism | Verdict | Notes |
|---|---|---|
| Amendment process (Art V) | **Good, one loophole** | Quarterly-only, evidence-required, no-changes-in-drawdown, max 2/quarter, changelog — institutionally credible. Loophole: "evidence" is not quantified, so motivated narrative can qualify (§3.5) |
| Override process (Art VII) | **Weak** | Single-use + dissent recording is right; **no rate limit** makes it the universal bypass (§3.4) |
| Circuit breaker | **Half-built** | Trip condition crisp; **re-arm undefined → deadlock** (audit C3, sim-confirmed). Also: per-episode 8% does not bound cumulative DD (audit C2) |
| Drawdown controls | **Good below the breaker** | −2.5%/−4% daily and −5% soft de-risk ladder is sound; the gap is above the breaker (no cumulative floor) |
| Self-termination rules | **Right idea, gameable bands** | Expectancy/benchmark/adherence gates exist — rare and creditable. But the bands have gaps (§3.1, §3.2) |

## 2. Breaker Completion (fixes audit C2 + C3 — adopt verbatim)

1. **Re-arm rule**: after a trip, once the post-mortem is acknowledged and
   the 5-session cooldown ends, the drawdown anchor RESETS to equity at
   resumption. The anchor thereafter ratchets up with equity (it is a new
   HWM-style watermark). A further −8% from that anchor = second trip.
2. **Cumulative hard floor**: if equity falls **15% below the all-time
   deposit-adjusted HWM** — regardless of anchors, episodes, or regime —
   all positions including core are closed, live trading ends, system
   reverts to Phase 1 (paper). Resumption requires the full paper gate AND
   explicit user re-authorization. This is the bound the breaker alone
   cannot provide.
3. **Restated risk envelope** (replaces the false "≤10%"): per-episode pain
   ~8–10%; cumulative worst-case bounded at 15% by the hard floor; sim p95
   3-year MaxDD ~20% *without* the floor, so the floor is expected to bind
   in roughly the worst decile of 3-year paths.
4. **Core inclusion**: a breaker trip flattens satellites only; the **hard
   floor flattens everything including core** (closes the "core rides a
   crash uncovered" gap from the audit).

## 3. The Seven Indefinite-Failure Paths, Closed

**3.1 The zombie band.** Expectancy gates stop trading at ≤0R/30 trades, and
the "minimum acceptable" is +0.10R — but nothing fires between 0 and +0.10R.
A system earning +0.05R/trade (working hard, going nowhere, eating risk)
runs forever. → **Close**: rolling 60-trade expectancy < +0.10R → demote to
Phase 2 (half risk); two consecutive 60-trade windows below → Phase 1 paper.

**3.2 The benchmark-gate reset.** "12 *consecutive* months underperforming
QQQ" resets on one lucky month; a system can lose to the benchmark 11 months
out of every 12, forever. → **Close**: evaluate quarterly on a *rolling*
12-month window; if the system trails QQQ on BOTH return and MaxDD in **3 of
the last 4 quarterly checks**, the index-the-capital recommendation becomes
mandatory and is re-issued every month until resolved.

**3.3 Gate cycling.** Fail live → pass an 8-week paper gate in a friendly
regime → fail live again, repeatedly: each cycle looks legitimate. →
**Close**: 3 live→paper demotions within 24 months = structural failure;
live trading may not resume on the same strategy parameters — a full
quarterly-amendment-grade revision (with walk-forward evidence) is required.

**3.4 Override accumulation.** Overrides are single-use but unlimited; 20
single-use overrides is a discretionary fund. → **Close**: (a) max **2
overrides per calendar month**; the third halts trading pending governance
review; (b) **no overrides while drawdown > 5%** (mirrors the amendment
rule — drawdowns are when overrides are most wanted and worst); (c) monthly
report carries an override scoreboard (override P&L vs counterfactual
rule P&L) so the cost of discretion is measured, not felt.

**3.5 Evidence-free amendments.** Art V requires "evidence" without defining
admissibility, so a persuasive paragraph qualifies. → **Close**: an
amendment proposal is admissible only with attached out-of-sample or
walk-forward numbers (IMPLEMENTATION_ROADMAP §2 protocol) OR ≥20 live trades
of relevant data; proposals without numbers are rejected without discussion.
Default verdict on any ambiguity: rejected.

**3.6 Narrated metrics.** All gates consume numbers currently computed and
reported by the same model whose performance they judge — grade inflation
needs no malice, only optimism. → **Close**: metrics are computed by a
deterministic script from `state/equity_curve.csv` + journal frontmatter
(V3 #11); the narrative may interpret the numbers but never produce them.
Gate evaluation quotes script output verbatim.

**3.7 Paralysis (the opposite failure).** Deadlocked breaker (C3), undefined
resumption for Art IV halts 2/3/4/7, and an unbounded paper phase can park
capital in limbo indefinitely — slow failure by inaction. → **Close**: every
halt type gets the breaker's resumption protocol (post-mortem → user ack →
cooldown → re-arm); any halt persisting > 20 trading days without user
response escalates to a standing weekly reminder with a default
recommendation (usually: move to cash/index until resolved).

## 4. Resumption Sequencing (fixes audit C6)

After ANY stop-trading event, in order: (1) written post-mortem; (2) user
acknowledgment; (3) cooldown elapses; (4) paper gate IF the event was a
full stop (hard floor, expectancy stop, adherence stop, 2-trips rule) —
skip for a single breaker trip; (5) re-enter live at **Phase 2 half-risk
for 10 trades**, always, regardless of prior phase; (6) Phase 3 restoration
per the existing gate. One path, no ambiguity.

## 5. Amendment Required

Adopting §2–§4 changes GOVERNANCE.md, RISK_FRAMEWORK.md, and
PERFORMANCE_EVALUATION.md. Per Art V these go to the user for written
approval (they are risk-REDUCING, so they qualify for immediate adoption on
approval rather than waiting for a quarterly window). Proposed changelog
entries are drafted in V3_RECOMMENDATIONS.md.
