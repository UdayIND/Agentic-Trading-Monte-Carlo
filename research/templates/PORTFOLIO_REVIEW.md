# PORTFOLIO REVIEW — {YYYY-MM-DD} (portfolio intelligence, monthly cadence)

Data: get_portfolio + get_equity_positions + state CSVs, THIS session —
never remembered values. Computed metrics via tools/metrics.py; anything
hand-derived shows its work.

## 1. Book snapshot
| | Value | % of equity |
|---|---|---|
| Equity (TWR-consistent) | | |
| Cash (settled / unsettled) | | |
| Core position | | |
| Satellites (list) | | |
| Portfolio heat (open risk to stops) | | vs cap {} |

## 2. Allocation & exposure
- Sector exposure (positions + core look-through): {table} · concentration flag if any sector > {cap}
- Market-cap mix: {mega/large/mid/small %}
- Geographic (revenue look-through where known): {}
- Factor lens (qualitative until tooling exists): momentum {} · growth/value tilt {} · quality {} · rate sensitivity/duration {}
- Currency: {USD-only or note}

## 3. Concentration & correlation
- Largest position % {} · top-3 % {} · vs RISK_FRAMEWORK caps {}
- Correlation buckets honored? {} · QQQ-equivalent exposure {}% vs 60% cap
- Hidden single-trade check: do the positions share one macro driver
  (e.g., all long rates-down)? {name it}

## 4. Risk metrics
- Realized vol (20d) of the book {} vs benchmark {}
- Current drawdown from HWM: {}% · deposit-adjusted floor distance (15% hard floor): {}
- Stress: book P&L under −20% index gap (per-position, gap-case fields from trade plans): {}
- Stop integrity: every position has a live protective order? {verified list}

## 5. Performance attribution (period)
TWR {}% vs QQQ {}% · gap explained by: {selection / sizing / cash drag /
costs — numbers} · Expectancy by playbook (from metrics pack): {}

## 6. Liquidity
Days-to-exit at ≤10% ADV per position: {} · any name failing the
liquidity floor at current equity: {}

## 7. Tax awareness (taxable account — knowledge/tax-basics.md)
- Unrealized ST positions approaching LT (>1y) status worth noting: {}
- Realized YTD: ST {} / LT {} · harvestable losses (wash-sale-safe): {}
- Re-entry wash-sale blocks currently active (30d from stop-outs): {}

## 8. Resilience actions
{Recommendations to improve diversification/resilience, each with expected
effect and cost. Routed as proposals through the normal pipeline — this
review changes nothing by itself. "No action needed" is a valid finding.}

## 9. The ignored risk
{At least one way this book is positioned to be wrong that nothing above
captured.}
