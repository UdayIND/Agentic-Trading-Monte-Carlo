# TECHNICAL ANALYSIS — One Input Among Many

Reference module. Standing constraint (CIO_MANDATE §6.3): TA is never the
sole basis for a research conclusion. Its legitimate jobs here: **timing,
risk placement (stops), and regime/participation measurement** — the
execution layer under a fundamental/macro thesis. Indicator values must be
computed from fetched bars in the current run (RESEARCH_PROCESS §5), never
estimated.

## 1. What TA actually is

Price/volume as the record of aggregate positioning and behavior. The
honest case: markets trend (momentum is real, §investing-styles), and
support/resistance mark memory (supply from trapped holders, demand from
regretful non-buyers). The dishonest case: pattern astrology with
after-the-fact narratives. The line between them: **falsifiability** — a
level or signal you can state in advance, with an invalidation, is usable;
a story told about a chart afterward is not.

## 2. Market structure

- Trend definitions: higher highs + higher lows (up), the reverse (down),
  neither (range). Structure break = the earliest, noisiest reversal signal.
- Support/resistance: prior swing points, high-volume consolidation zones,
  round numbers, gap edges. Zones, not lines — precision is fake.
- Confirmation hierarchy this system uses: price > 50d > 200d SMA with both
  rising = uptrend confirmed (the STRATEGY_v2 trend axis).

## 3. The working toolkit

| Tool | Measures | Use here | Known trap |
|---|---|---|---|
| Moving averages (20/50/200 SMA) | Trend + dynamic S/R | Regime axis (tools/regime.py); trend filter for setups | Whipsaw in ranges; MA cross signals lag badly |
| RSI (14) | Momentum oscillator, 0–100 | Overbought/oversold *within a range*; divergence as a caution flag | "Overbought" stays overbought in strong trends — not a short signal |
| MACD | MA convergence/divergence | Trend-momentum confirmation, divergences | Late by construction; useless in chop |
| VWAP | Volume-weighted session mean | Execution quality benchmark (are we paying above/below the day's fair price) | Intraday tool; resets daily |
| ATR (14) | Average true range (volatility) | **Stop distance and position sizing** — our primary TA dependency (n×ATR stops in trade plans) | ATR shrinks in calm — stops set in quiet regimes are too tight for storms |
| Volume | Participation/conviction | Breakout validation (≥1.5× 20d avg rule in opportunity scoring) | Volume spikes mark exhaustion as often as initiation |
| Relative strength (vs SPY/sector) | Leadership | Watchlist ranking, sector rotation table | RS reverses violently at regime turns |

## 4. Breadth & internals

Percent of names above 50d/200d SMA, advance-decline behavior, equal-weight
vs cap-weight (RSP vs SPY) — measure whether "the market" is one index or
many stocks. Narrow leadership + index highs = fragility flag (already a
divergence check in the weekly process). We compute labeled *proxies* from
the watchlist and sector ETFs — no direct A-D feed; never present a proxy
as the real internal.

## 5. Integration rules (binding)

1. TA enters research artifacts under `[DATA]`/`[ANALYSIS]` labels with the
   computation shown (bars fetched, formula, value).
2. Fundamental thesis + technical timing is the intended pairing;
   technicals alone ≥ conviction 80 is impossible by construction (the
   conviction framework's components cap the technical contribution).
3. Every technical signal states its invalidation level at the moment it's
   cited — a signal without invalidation is a story.
4. In conflict, risk rules > technicals: a stop is never widened because
   "support is just below" (GOVERNANCE; FAILURE_MODES).
