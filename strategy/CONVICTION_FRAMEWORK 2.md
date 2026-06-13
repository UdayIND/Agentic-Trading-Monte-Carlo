# CONVICTION FRAMEWORK — The Single Gating Score (v4)

Supersedes the Opportunity Ranking System in RESEARCH_PROCESS §4 as the
gating metric (that system's technical components live on inside this one).
Every candidate gets a CONVICTION_SCORE 0–100 plus a **written explanation
of why each component earned its points** — numbers without prose are
invalid.

## Hard Disqualifiers (score = 0, components irrelevant)

Earnings ≤ 10 calendar days · bottom-3 RS sector · liquidity floor fail
(ADV < $50M, price < $5, spread > 0.3%) · playbook disabled by current
regime · re-entry ban active · any RISK_FRAMEWORK hard-limit breach at
proposed size. Component excellence cannot rescue a disqualified name.

## Components (sum = 100)

| # | Component | Max | Scoring anchor (full / half / zero) |
|---|---|---|---|
| 1 | **Technical alignment** | 15 | Textbook playbook-card match with trigger present / one marginal criterion / two+ blemishes (= don't score it) |
| 2 | **Market regime alignment** | 12 | Playbook is the regime's primary (e.g., TF in BULL_QUIET) / permitted but secondary / pending regime change in confirmation = 0 |
| 3 | **Sector strength** | 10 | Sector RS rank 1–3 / rank 4–5 / rank ≥ 6 |
| 4 | **Relative strength (name)** | 12 | Beats SPY 1m AND 3m, top quartile of watchlist / beats both, not top quartile / beats one only = 4 |
| 5 | **News quality** | 8 | Thesis-consistent verified catalyst or clean tape / no news (neutral is fine = 6) / unexplained move, contradicting story, or single-source hype = 0 |
| 6 | **Earnings risk** | 8 | > 15 days or just reported / 11–15 days / (≤ 10 = disqualified above) |
| 7 | **Liquidity quality** | 8 | ADV > $200M and spread < 0.15% / above floors / near floors = 2 |
| 8 | **Volatility suitability** | 8 | ATR sizing yields ≥ 1 whole share within caps AND daily ATR% in 1–4% band / works via ETF proxy / sizing math marginal |
| 9 | **Risk/reward quality** | 12 | ≥ 3:1 to realistic target / ≥ 2.5:1 / 2:1 (the floor) = 4 |
| 10 | **Correlation impact** | 7 | Adds a new bucket or first satellite / second in bucket within caps / brings book near QQQ-equiv cap = 1 |

## Bands (binding)

| Score | Meaning | Action |
|---|---|---|
| **< 70** | Reject | Logged in TOP_OPPORTUNITIES with exclusion reason |
| **70–79** | Watchlist only | Tracked in `state` conviction watchlist; re-scored when something changes; never traded at this band |
| **80–89** | Tradable | Eligible for the full Stage 4–7 pipeline |
| **90+** | High conviction | Same risk limits (conviction NEVER increases size — Art III); priority when slots are scarce; this is the v2 "A+" equivalent required for BEAR_QUIET entries |

## Capital Flow Modifier (v4.1 — bounded, evidence-only)

After the 10 base components, a CAPITAL_FLOW_SCORE modifier may apply per
`CAPITAL_FLOW_INTELLIGENCE.md` §4: range **+5 to −7** (validated sources) or
**+2 to −4** (cold start / unvalidated priors); **0 is the default** and
requires no justification. The modifier applies only to fully verified
signals (5-check protocol), is shown as pre/post scores in the write-up
with its evidence trail, may move a name across the 80 threshold in either
direction, and may NEVER touch position size, risk limits, or any other
gate. A neutral or absent capital-flow read is not a negative — most names,
most days, have no meaningful capital-flow information.

## Anti-Gaming Rules

1. **Conviction is a filter, not a multiplier.** Position size comes from
   the volatility formula alone. A 95 trades the same dollars as an 81.
2. **Score before challenge, re-score after.** If the bear case lands real
   hits, components are re-marked; a trade entering Stage 4 at 84 may die at
   77. The pre/post pair is recorded.
3. **Distribution audit** (monthly, Compliance): mean nomination score
   outside 72–85, or > 30% of scores landing 90+, or zero rejections in a
   month with ≥ 5 scans ⇒ the scorer is drifting; recalibrate against this
   document's anchors.
4. **No component may be scored without its evidence inline** (the actual
   RS numbers, the ATR, the spread, the source for the news claim). An
   unevidenced component scores 0, not "probably fine."
5. Half-points and interpolation are allowed; optimistic rounding is not —
   round toward zero.
