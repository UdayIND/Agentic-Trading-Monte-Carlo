# INVESTING STYLES — What Each Is, When It Works, How It Fails

Reference module. Each style: core logic, evidence, failure mode, and what
this system takes from it. No style is "the answer"; every documented style
has multi-year stretches of underperformance — style discipline matters more
than style choice.

## 1. Value

Buy assets below intrinsic worth; margin of safety absorbs estimation error.
Classic metrics: P/E, P/B, EV/EBIT, FCF yield. Evidence: long-run value
premium (Fama-French HML), but severe droughts (2010s growth decade).
**Fails when**: cheapness reflects real impairment (value traps — dying
industries, leverage, fraud). Cheap + deteriorating fundamentals is not
value. **We take**: margin-of-safety thinking; valuation as a component of
conviction, never the whole case.

## 2. Growth

Pay up for compounding revenue/earnings; the market systematically
underestimates duration of growth for the best businesses. **Fails when**:
growth decelerates — multiple compression and estimate cuts compound each
other (double-kill). Terminal-value fantasies justify any price. **We
take**: revenue durability and TAM realism checks in COMPANY_DEEP_DIVE;
respect that expectations, not results, set prices.

## 3. Quality

High ROIC/ROE, stable margins, low leverage, honest accounting, durable
moat. Evidence: QMJ ("quality minus junk") premium; quality holds up best
in drawdowns. **Fails when**: paying any price for quality (Nifty Fifty
1972); quality is backward-looking when the moat is eroding. **We take**:
the moat/margin/balance-sheet sections of the research template; quality as
downside protection.

## 4. GARP (Growth At a Reasonable Price)

Hybrid: growth with a valuation governor (Lynch's PEG heuristic, PEG < 1
attractive). Practical discipline: refuse the top valuation decile even for
great stories. **Fails when**: "reasonable" gets redefined in bull markets.
**We take**: valuation sensitivity tables — what growth rate is embedded in
the current price?

## 5. Factor investing

Systematic exposure to documented return premia: value, size, momentum,
quality, low-volatility. Evidence: decades of academic literature
(Fama-French 1992/2015, Jegadeesh-Titman 1993, AQR replications), but
premia decay post-publication and factors crowd. **Fails when**: factor
crashes (momentum 2009); when the premium was data-mining. **We take**:
factor vocabulary for portfolio exposure analysis (PORTFOLIO_REVIEW §4) —
know which factors the book is long, deliberately or not.

## 6. Momentum

Winners keep winning 3–12 months out; strongest, most replicated anomaly.
Cross-sectional (relative strength) and time-series (trend) variants.
**Fails when**: sharp reversals at regime turns (2009-style momentum crash:
the short-crash leg); whipsaw in ranging markets. **We take**: the entire
STRATEGY_v2 setup engine is trend/RS-based; the regime matrix is the
whipsaw defense.

## 7. Mean reversion

Prices overshoot; extremes revert. Works on short horizons (days–weeks,
RSI-type oversold bounces) and very long ones (valuation cycles); fights
momentum in between. **Fails when**: "oversold" keeps falling — mean
reversion in a delisting is −100%. Requires a solvency/quality floor.
**We take**: the MR playbook exists but is regime-gated; never catch knives
without a structural floor.

## 8. Macro

Trade the cycle: growth, inflation, policy, liquidity, positioning across
asset classes. **Fails when**: right analysis, wrong timing ("the market
can stay irrational longer than you can stay solvent"); narrative
overconfidence. **We take**: macro as *context and risk posture*
(regime matrix, event calendar, no-entry windows) — never as a directional
trade signal by itself (RESEARCH_PROCESS §3).

## 9. Dividend / income

Total return = price + income; dividend *growth* (not headline yield) marks
discipline and cash generation. Aristocrat-type screens favor durability.
**Fails when**: yield-chasing — a 9% yield is usually a price collapse
announcing a cut; payout ratios > earnings power. **We take**: dividend
safety checks (payout ratio vs FCF, not EPS) in the research template.

## 10. ETF / passive indexing

Owning the market cheaply is the performance benchmark that active decisions
must beat *after* costs and taxes; most professionals don't (SPIVA
scorecards, persistently). **We take**: QQQ buy-and-hold is this system's
honest benchmark (PERFORMANCE_EVALUATION); ETFs are the default expression
when single-name edge is absent; underperform the benchmark long enough and
the correct trade is indexing (self-termination gates).

## 11. Options fundamentals (knowledge only — no options approval on this account)

Calls/puts = convex claims; price = intrinsic + time value; Black-Scholes
inputs (spot, strike, vol, time, rate) and the Greeks (delta, gamma, theta,
vega). Covered calls harvest income and cap upside; protective puts are paid
insurance; implied volatility is the market's uncertainty price — often more
informative than the option trade itself (e.g., earnings implied move).
**We take**: reading IV/implied move as *information* for equity decisions.

## 12. Portfolio construction (the meta-style)

Diversification is the only free lunch (Markowitz), but it lives on
imperfect correlations — which converge toward 1 in crises. Position sizing
and rebalancing discipline dominate security selection for realized
outcomes. Concentration builds wealth, diversification keeps it. **We
take**: the 5-layer risk system, heat caps, and correlation buckets in
RISK_FRAMEWORK are the binding implementation.

## Style interaction summary

| Pairing | Relationship |
|---|---|
| Value × Momentum | Negatively correlated premia — the classic diversifying pair |
| Quality × Value | Quality filters value traps; value disciplines quality's price |
| Momentum × Mean reversion | Opposed on 1–12m horizon; separated by regime and timeframe |
| Macro × everything | Sets the risk posture within which the others operate |
