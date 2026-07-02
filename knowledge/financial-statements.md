# FINANCIAL STATEMENTS & FILINGS — Reading Order, Signals, Red Flags

Reference module. Primary sources (SEC EDGAR) outrank every secondary
summary. Read the filing, not the press release about the filing.

## 1. Income statement

Revenue → gross profit → operating income → pretax → net income.
- **Revenue quality** first: organic vs acquired, volume vs price, segment
  mix, geographic mix, deferred-revenue trend (SaaS), backlog.
- **Margins tell the story**: gross margin = pricing power + input costs;
  operating margin = discipline + leverage on scale; watch the *trend*, not
  the level (levels are industry-relative).
- **Below the line**: one-time items that recur every quarter aren't
  one-time. GAAP vs adjusted gap widening = warning.
- Operating leverage: revenue Δ% vs opex Δ% — incremental margins reveal
  what the next dollar of revenue earns.

## 2. Balance sheet

Assets = liabilities + equity; it's the *risk* statement.
- **Liquidity**: cash + equivalents vs short-term debt; current ratio;
  revolver capacity and covenants (in the 10-K debt footnote).
- **Leverage**: net debt / EBITDA; interest coverage (EBIT / interest);
  maturity wall (when does the debt come due, at what refinancing rate?).
- **Working capital**: receivables growing faster than revenue = channel
  stuffing risk; inventory building ahead of demand = margin risk (DSO,
  DIO, DPO and the cash-conversion cycle).
- **Soft spots**: goodwill (overpayment memorial — test for impairment
  risk), capitalized costs, pension gaps, operating leases, off-balance
  obligations (all in footnotes).

## 3. Cash flow statement

The reconciliation of accounting to reality; hardest to fake.
- **CFO vs net income**: persistent NI > CFO = accruals doing the earning.
- **FCF = CFO − capex** (distinguish maintenance vs growth capex when
  disclosed). FCF funds everything real: dividends, buybacks, debt paydown.
- **Stock-based comp**: non-cash in CFO but real dilution — count it
  (FCF-per-share, diluted, is the honest series).
- **Financing section**: is the company a net issuer or net retirer of its
  own shares and debt? That's capital allocation revealed, not narrated.

## 4. Statement of shareholders' equity

Share count trajectory (dilution vs buyback, and buyback *price* vs
intrinsic value), accumulated OCI (FX, hedges), retained earnings vs
distributions. Buybacks above intrinsic value destroy value regardless of
EPS optics.

## 5. Filing hierarchy

| Filing | Cadence | What it's for |
|---|---|---|
| 10-K | Annual, audited | Business description, risk factors (read the *changes* vs prior year), MD&A, full footnotes, segment data |
| 10-Q | Quarterly, unaudited | Trend confirmation; MD&A deltas; new litigation/liquidity language |
| 8-K | Event-driven | Earnings releases, M&A, executive departures (esp. CFO — a resignation "to spend time with family" mid-quarter is a flag), covenant events |
| DEF 14A (proxy) | Annual | Compensation structure (what management is actually paid to do), board quality, related-party transactions, ownership |
| Form 4 | ≤2 business days | Insider trades — open-market buys are the signal; sales are usually noise (see CAPITAL_FLOW_INTELLIGENCE for this system's bounded use) |
| 13F | Quarterly, 45d lag | Institutional holdings — stale by design; position *changes* over levels |
| 13D/13G | Event-driven | ≥5% owners; 13D = activist intent, 13G = passive |
| S-1 / 424B | Offering | IPO/secondary economics: who is selling, lockups, use of proceeds |

## 6. Earnings calls & investor presentations

- The **Q&A is the content**; the prepared remarks are marketing. Listen
  for: dodged questions, new hedging language ("headwinds", "visibility"),
  metric definitions quietly changing, guidance philosophy.
- Compare *this* quarter's language to *last* quarter's (diff the
  transcripts). Managements telegraph deterioration in vocabulary before
  numbers.
- Investor decks: check what KPI got dropped from the deck — discontinued
  disclosure usually means the number turned bad.

## 7. Red-flag checklist (accounting quality)

1. Revenue recognized faster than cash collected (DSO trend up).
2. Widening GAAP vs non-GAAP gap; serial "one-time" charges.
3. CFO persistently below net income.
4. Auditor change, CFO exit, delayed filing (NT 10-K/Q), material weakness.
5. Related-party transactions in the proxy.
6. Frequent restructurings that reset the margin narrative.
7. Acquisitions that obscure organic decline (roll-ups without organic
   disclosure).
8. Inventory or receivables growth ≫ revenue growth.
9. Aggressive capitalization (costs pushed to the balance sheet).
10. Buybacks funded by debt while insiders sell.

Any two of these = mandatory deeper pass before the name is investable.
