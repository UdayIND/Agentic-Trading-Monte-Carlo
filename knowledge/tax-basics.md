# TAX BASICS — US Individual Taxable Account (This Account's Reality)

Reference module. The Agentic account is an individual **taxable cash
account** — every realized gain is a tax event. Tax is a *drag input* to
decisions, never the decision itself ("don't let the tax tail wag the
investment dog" — but know the size of the tail). This is general US
knowledge, not tax advice; rates/brackets change — verify current-year
figures before relying on them.

## 1. Capital gains mechanics

- **Short-term** (held ≤ 1 year): taxed as **ordinary income** (up to 37%
  federal under current law).
- **Long-term** (held > 1 year): preferential rates (0% / 15% / 20% by
  bracket) + 3.8% NIIT above MAGI thresholds.
- The differential (often 10–20 points) is the single biggest tax lever a
  swing-trading system gives up by design. An active strategy must beat a
  passive one by roughly its tax drag *on top of* costs to be worth running
  — this belongs in the annual review's honest math.
- Holding-period arithmetic: the clock starts the day after purchase;
  "held > 1 year" means sold on the first anniversary + 1 day or later.

## 2. Wash-sale rule (the active trader's trap)

Selling at a **loss** and buying a "substantially identical" security within
**30 days before or after** disallows the loss (it defers into the
replacement lot's basis). Consequences for this system:
- Re-entering a stopped-out name within 30 days forfeits the loss deduction
  for that year. The journal must track stop-out dates for re-entry checks.
- Applies across accounts (including IRAs — where the loss dies
  permanently). Currently applies to securities, not (as of last verified
  law) to direct commodity/crypto — verify before relying.

## 3. Dividends

- **Qualified** (most US common stock dividends, ≥61-day holding around
  ex-date): long-term capital-gains rates.
- **Ordinary/non-qualified** (REITs, most bond-fund income, short holds):
  ordinary rates.
- Rapid trading around ex-dates converts qualified → ordinary (the 61-day
  requirement) — another quiet cost of churn.

## 4. Tax-aware practices (applicable here)

1. **Loss harvesting**: realized losses offset gains + up to $3,000/yr of
   ordinary income; excess carries forward indefinitely. Harvesting into
   year-end against realized ST gains is standard hygiene — subject to
   wash-sale spacing.
2. **Lot selection**: specific-identification beats FIFO when trimming —
   choose the lot that produces the intended tax result (Robinhood supports
   per-order lot choice on sells; verify at execution time).
3. **Gain deferral asymmetry**: unrealized gains compound pre-tax
   (deferral = an interest-free loan of the tax); this is the quantitative
   core of the long-horizon lens in CIO_MANDATE §6.4.
4. **ETF structural efficiency**: in-kind creation/redemption makes broad
   ETFs distribute near-zero capital gains vs mutual funds — relevant to
   the passive benchmark's *after-tax* superiority.
5. **Record-keeping**: the journal + decision log already capture dates and
   prices; 1099-B reconciliation at year-end closes the loop.

## 5. What the annual review must compute

After-tax, after-cost strategy return vs after-tax QQQ buy-and-hold on the
same capital and period. If the strategy's edge is smaller than its tax
drag, the honest conclusion is indexing — per the self-termination gates
(PERFORMANCE_EVALUATION). Report it plainly.
