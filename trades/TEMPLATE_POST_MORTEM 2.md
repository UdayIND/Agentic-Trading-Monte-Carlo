# POST_MORTEM_{TICKER}_{exit YYYY-MM-DD}
Trade: {entry date} → {exit date} · {playbook} · Planned {x}R → Realized {y}R
Exit reason: {stop | T1/T2+trail | time stop | regime | earnings | verification-cancel}

## The Seven Questions (answer all; "partially" requires the split)
1. **Was the thesis correct?** {Did the expected thing happen, regardless of P&L?}
2. **Was the execution correct?** {Entry vs plan, slippage, stop placed on time, partials taken at levels?}
3. **Was the risk management correct?** {Size right, heat right, stop never widened, exits honored?}
4. **What signals worked?** {Which scored components predicted the outcome?}
5. **What signals failed?** {Which components were wrong or inflated — feed §3 of the conviction audit}
6. **What was luck?** {Outcome drivers nobody analyzed: surprise news, market beta, gap direction}
7. **What was skill?** {Only what the plan explicitly anticipated}

## Grade matrix (the only four honest outcomes)
| | Process right | Process wrong |
|---|---|---|
| **Won** | good trade | **dangerous win — flag it** |
| **Lost** | good trade, bad luck | bad trade |
Grade: {} · One-sentence why: {}

## Lesson
{New lesson → add to LESSONS_LEARNED.md with this trade as evidence.
Recurring lesson → increment its count there. No lesson is a valid answer —
do not manufacture insight from noise.}
