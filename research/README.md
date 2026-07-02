# RESEARCH DEPARTMENT — Manual

The fundamental research arm established by strategy/CIO_MANDATE.md (v7).
Output: **balanced investment theses**, never buy/sell instructions —
execution decisions belong exclusively to the DECISION_ENGINE pipeline and
its gates. Research feeds the watchlist and the conviction score; it cannot
bypass either.

## Directory layout

| Path | Content |
|---|---|
| `research/QUEUE.md` | Prioritized research backlog — what to research next and why |
| `research/templates/` | The four working templates (below) |
| `research/companies/{TICKER}_{YYYY-MM-DD}.md` | Completed company deep-dives |
| `research/earnings/{TICKER}_{QQ-YYYY}.md` | Earnings reviews |
| `research/macro/{YYYY-MM-DD}_macro-review.md` | Structural macro reviews |
| `research/portfolio/{YYYY-MM-DD}_portfolio-review.md` | Portfolio intelligence reviews |

## Templates

| Template | When used |
|---|---|
| `templates/COMPANY_DEEP_DIVE.md` | Before any single name becomes conviction-eligible; refreshed on thesis-relevant news or annually |
| `templates/EARNINGS_REVIEW.md` | Within 2 sessions of results for any holding or high-priority watchlist name |
| `templates/MACRO_REVIEW.md` | Monthly (structural), and on regime-relevant macro breaks |
| `templates/PORTFOLIO_REVIEW.md` | Monthly with the risk review; on any material book change |

## Quality standards (binding)

1. **Epistemic labels** on every claim — `[FACT] [DATA] [CONSENSUS]
   [ANALYSIS] [HYPOTHESIS] [SPECULATION]` per CIO_MANDATE §2, on top of v5
   evidence tags. Untagged market facts are violations.
2. **Primary sources first**: filings and official releases before press;
   web content quarantined per TOOL_USAGE_GUIDE. No fabricated data, ever.
3. **Both sides**: bull and bear cases are separately argued, each at its
   strongest (steelman, not strawman). A deep-dive without a credible bear
   case is incomplete.
4. **Falsifiability**: every thesis names the evidence that would kill it
   and the monitoring events that would surface that evidence.
5. **Uncertainty stated**: ranges + confidence (v5 calibration scale),
   logged so calibration can be scored. Never a point estimate presented
   as fate.
6. **The seven questions** (CIO_MANDATE §3) answered before any
   recommendation leaves the desk.
7. **Horizon declared**: every thesis states its time horizon; multi-year
   theses are first-class citizens.
8. **Anti-churn applies**: re-opening a completed deep-dive without new
   information is churn. New information = new filing, new quarter, thesis
   trigger hit — not a price move alone.

## Pipeline position

```
QUEUE.md → deep-dive (this desk) → watchlist candidacy (RESEARCH_PROCESS §2.5 rules)
        → conviction scoring (CONVICTION_FRAMEWORK) → DECISION_ENGINE stages → decision
```

Research raises or lowers *conviction inputs*; it never places, sizes, or
times an order. Sizing is guard.py's job; timing is the setup playbooks'.
