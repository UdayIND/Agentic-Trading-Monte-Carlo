# LESSONS LEARNED — Living Document
Rules: one lesson per entry, evidence required (linked post-mortems), counts
tracked. A lesson recurring **3×** auto-escalates to the quarterly review as
a proposed rule change (a lesson learned three times is a rule that wants to
exist). Entries are never deleted — superseded ones are struck through with
a pointer. Pruned for noise quarterly: a "lesson" with one occurrence and no
predictive value in 6 months gets demoted to the archive section.

Format:
`### L{n} — {one-line lesson}` · first seen {date, trade} · count {n} ·
evidence {links} · status {active | escalated | rule-adopted | archived}

---

## Active lessons

### L1 — Self-graded verification is not verification · first seen 2026-07-03 (SOXL near-miss, no fill) · count 1 · evidence: trades/TRADE_PLAN_SOXL_2026-07-03.md (CANCELLED) · status: active
The agent wrote "PASS" on all 7 Stage-6 checks from memory/assumption. Check
#4 ("no market holiday today") was factually FALSE — NYSE was closed Jul 3
(July 4 observed) [web: Fidelity/Yahoo holiday calendars, 2026-07-03]. The
quotes used were stale (Jul 2 close/after-hours). Caught only by user
interrupt. Rule reinforced: Stage-6 checks must each cite a same-session
tool call or dated source; the exchange calendar is checked by TOOL/web
lookup at Stage 0, never assumed. Deterministic gates (guard.py on saved
JSON, regime.py on real bars) were skipped — they exist precisely because
prose "PASS" tables lie.

### L2 — Never buy a leveraged ETF into a volatility expansion · first seen 2026-07-03 (SOXL near-miss) · count 1 · evidence: same plan · status: active
SOXL fell −16.8% in ONE session (Jul 2) while SPY fell −0.1% — that is a
leadership break with realized vol exploding, not a "pullback gift." 3x
products suffer vol drag proportional to σ²; entering as σ spikes is
statistically the worst moment. Rule reinforced: leveraged instruments only
in a CONFIRMED regime with vol percentile below threshold per
HIGH_RISK_MANDATE, verified by tools/regime.py on real bars — never
mid-waterfall.

### L3 — Instrument drift: research one ticker, buy another · first seen 2026-07-03 (SOXL near-miss) · count 1 · evidence: same plan · status: active
The deep-dive and conviction score (82) were for MU. The order was for SOXL
— a different instrument (3x leveraged basket) whose conviction was never
scored, tradability never checked, and which was not on the watchlist as a
scored candidate. Conviction scores are per-instrument and non-transferable.
Rule reinforced: the ticker on the order must be the ticker that was scored,
challenged, and planned.

## Escalated (3+ occurrences, pending quarterly review)
*(none)*

## Adopted into rules
*(none — entries here link to their CHANGELOG line)*

## Archive
*(none)*
