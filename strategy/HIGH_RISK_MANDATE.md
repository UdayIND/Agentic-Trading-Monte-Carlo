# HIGH-RISK MANDATE + AUTONOMOUS EXECUTION (v8)

Adopted 2026-07-02 by user directive in writing (GOVERNANCE Art V,
user-directed clause). Two directives, recorded verbatim in substance:

1. **"Goal is high risk, high returns."**
2. **"Claude should always automatically execute trades without me
   messaging, based on our goals and targets — and also execute those
   trades. Set it up that way."**

Plus: user reports **$500 deposited** (2026-07-02; unverified until the
first MCP session confirms via get_portfolio).

## 1. CIO statement of record (honesty rule — read once, it stands)

The user has waived the 8-week paper gate and the operator-approval loop by
explicit written override. That is the user's right and it is now recorded:
**the system's edge is unproven; this is live capital on an untested
strategy.** With $500 and a high-risk profile, drawdowns of 30%+ are a
plausible outcome, not a tail case. The professional framing: this is
tuition-scale capital being used to develop a live track record. The system
will pursue high returns aggressively WITHIN the parameters below — but it
will not pretend the risk isn't real, and it will report every loss plainly.

## 2. High-risk parameter set (supersedes conflicting v2 soft limits; sized for ~$500)

| Parameter | v2 (old) | **v8 (high-risk)** | Rationale |
|---|---|---|---|
| Risk per trade (stop distance loss) | 1.5% | **5% of equity (~$25)** | 1.5% = $7.50 is untradeable at this size |
| Max concurrent positions | core+2 sat | **3** | Concentration is the only honest high-return path at $500 |
| Max single position (notional) | 25% | **40% (~$200)** | |
| Portfolio heat cap (sum of open risk) | 6–8% by regime | **15%** | |
| Instruments | stocks+ETFs | stocks+ETFs, **plus 2x/3x major-index/sector ETFs (e.g. TQQQ/SOXL): max 1 at a time, ≤25% of equity** | High-beta expression without single-name gap risk |
| Drawdown hard floor (deposit-adjusted) | 15% | **35%: equity ≤ 65% of net deposits → flatten everything, revert to paper, notify user** | The high-risk concession, with a survival bound |
| Circuit breaker / re-arm | Art IV | **unchanged** | |
| Anti-churn caps (2 entries/day, 6 orders/week) | yes | **unchanged** | High risk ≠ overtrading; churn kills expectancy |
| Stops mandatory, never widened; no averaging down; no same-day round trips (GFV) | yes | **unchanged** | Non-negotiable |
| Conviction gate ≥80 + guard.py PASS + Stage-6 verify | yes | **unchanged** | Autonomy is conditional on these |

Cash-account reality: T+1 settlement on $500 means capital cycles slowly;
the good-faith-violation rule (never sell a position bought with unsettled
funds before settlement) binds harder at this size. guard.py's verdict is
final on every one of these numbers.

## 3. Standing autonomous-execution authorization

- **Grant**: the agent executes trades in account 825795594 WITHOUT
  per-trade user approval, in any session (interactive or scheduled),
  when and only when ALL of the following pass in that same session:
  1. Robinhood MCP live; positions/portfolio freshly pulled;
  2. deposit/equity verified against state (no phantom capital);
  3. conviction ≥ 80 with a complete, on-disk trade plan (the Eleven);
  4. `tools/guard.py` verdict = PASS on saved tool-output JSON;
  5. Stage-6 pre-execution verification (7 points) at live prices;
  6. circuit breaker not active; drawdown floor not breached; caps clear.
- **Order mechanics unchanged**: review_equity_order → surface result →
  place_equity_order with fresh UUID; marketable LIMIT only; protective
  stop verified live after fill; journal + state updated same session.
- **Reporting instead of approval**: every execution is written to the
  journal, decision_log.csv, git (commit), and the command center when
  deployed. The v6 PENDING_APPROVAL loop becomes NOTIFY-AFTER for this
  account until this grant is revoked.
- **Revocation**: any user message revoking or narrowing this grant takes
  effect immediately. Hitting the 35% floor auto-revokes (revert to paper +
  notify). The grant is reconfirmed (or lapses to approval-mode) at each
  quarterly review — silence = lapse, by design.
- **What autonomy does NOT cover**: withdrawals/transfers, options (no
  approval on the account), any other account, overriding guard.py, or
  trading through a failed gate "because the user wants action." A blocked
  trade is reported, not forced.

## 4. Current gating status (2026-07-02)

Autonomy is GRANTED but execution is **mechanically blocked** until:
1. Robinhood MCP reconnected + OAuth (user: one command + auth);
2. $500 verified via get_portfolio;
3. MU + SNDK deep-dives complete (research/QUEUE P1 — first candidates);
4. a specific plan passes guard.py + Stage 6.

First-entry doctrine under this mandate: prefer pullback structure in H1
leaders over breakout chases (the group just ran +80% H1 and is being
profit-taken); size the first position at HALF the v8 maximums (proving-run
discipline); QQQ/SMH acceptable as the first instrument if single-name
plans fail quality gates.
