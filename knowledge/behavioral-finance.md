# BEHAVIORAL FINANCE — Bias Catalog and This System's Countermeasures

Reference module. The system's premise: the operator *and the agent* are
the primary risk (LLM failure modes are behavioral failure modes — see
CLAUDE.md anti-churn section and FAILURE_MODES.md). Each bias below maps to
an existing structural control; a bias without a control is a gap to log in
IMPROVEMENT_BACKLOG.

| Bias | Mechanism | Trading expression | Structural countermeasure here |
|---|---|---|---|
| Loss aversion | Losses hurt ~2× gains (Kahneman-Tversky) | Holding losers, cutting winners ("get back to even") | Pre-committed stops, never widened; time stops; post-mortems judge process not P&L |
| Disposition effect | Realize gains, defer losses | Selling winners early, riding losers | Profit-target/trail rules in the trade plan (the Eleven); R-multiple accounting |
| Overconfidence | Precision illusion, skill attribution | Oversizing, overtrading after wins | Fixed-fractional sizing via guard.py; conviction calibration scored in calibration_log.csv |
| Confirmation bias | Seek agreeing evidence | One-sided research | Mandatory bull AND bear case; fresh-context critic pass (no self-approval, v5) |
| Anchoring | First number dominates | "It was $200 once" = cheap at $120 | Valuation vs fundamentals, never vs price history; entry price irrelevant to exit rules |
| Recency bias | Overweight the latest data | Regime extrapolation, chasing last quarter's leaders | Regime classification is deterministic (tools/regime.py); weekly (not intraday) watchlist refresh |
| Sunk cost | Spent effort demands payoff | "I researched it for a week, I must trade it" | DO NOTHING is the default decision; research output is a thesis, not a trade |
| Action bias | Doing feels better than waiting | Overtrading in uncertainty — the documented #1 LLM-agent failure | Max 2 entries/day, 6 orders/week; no same-day round trips; re-analysis-without-new-info = stop |
| Herding / FOMO | Social proof | Buying strength late because everyone is | Setup + conviction gates (≥80); catalyst-spacing rule; no intraday ticker discovery |
| Narrative fallacy | Stories over base rates | "This time is different" / theme chasing | Evidence tags on every claim; consensus-vs-our-view stated explicitly |
| Hindsight bias | Past looks predictable | "The signal was obvious" → false confidence | Decision log with *ex-ante* confidence recorded; walk-forward replay quarterly |
| Survivorship bias | Only winners visible | Backtests on today's index members; idol-following | Monte Carlo on rule skeleton (not cherry-picked names); rejected variants logged in CHANGELOG |
| Gambler's fallacy / hot hand | Misread randomness | Doubling after losses; "due for a bounce" | Consecutive-loss de-risking rule; no averaging down, ever |
| Endowment effect | Owning inflates value | Holdings held to a lower bar than new ideas | Same conviction bar for HOLD as for BUY (the decision engine forces an explicit HOLD decision) |
| Ostrich effect | Avoid looking at losses | Skipped reviews in drawdowns | Mandatory cadence: daily state update, weekly scoreboard "report the gap honestly, in both directions" |
| Authority/source bias | Trust the famous source | Following gurus/insiders blindly | Capital-flow signals are bounded evidence (±5/7 max), validated quarterly, no permanent trust |

## Machine-specific addenda (this agent)

1. **Linguistic hedging executed as orders** — "maybe a small position" is
   how an LLM overtrades. Countermeasure: only the DECISION_ENGINE's binary
   gate output places anything; hedged language = DO NOTHING.
2. **Context-window amnesia** — conversational memory drifts from reality.
   Countermeasure: disk is truth (TOKEN_ARCHITECTURE); boot from files.
3. **Sycophancy** — telling the operator what they want to hear.
   Countermeasure: honesty standing order (report losses plainly); the
   bear case is mandatory even when the user is bullish.
4. **Fabrication under pressure** — inventing a price/fact to complete an
   answer. Countermeasure: evidence tags; "if a tool didn't return it, you
   don't know it."

## Design principles this catalog implies

- Controls must be **structural** (gates, caps, scripts), not aspirational
  ("be careful"). Willpower doesn't survive drawdowns; checklists do.
- Measure calibration, not vibes: stated confidence vs realized outcomes
  (EVALUATION_ENGINE) is the only honest overconfidence detector.
- The journal exists because memory is an unreliable narrator — of both
  wins and losses.
