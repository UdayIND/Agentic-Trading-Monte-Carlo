# OPERATOR MANUAL (v6) — You Are the Portfolio Manager

The AI is your research team. It analyzes, argues with itself, scores,
plans, and recommends. **It never gets authority.** Nothing reaches the
market without a row your authenticated session created. This manual is
your side of the contract.

## 1. Your Morning (9:20–9:30 ET, ~10 minutes)

1. Open **/** — read the decision banner. Most days: DO NOTHING, gray, done
   in 30 seconds. Gray days are the system working; resist the urge to
   want more.
2. If something is pending: open **/approvals**. For each ticket you see
   one screen: conviction (pre→post challenge), bull and bear side by side,
   the PM rebuttal, risk worksheet, quality report, the eleven-field plan.
3. Decide:
   - **APPROVE** — you agree the process was followed AND the trade is
     sound. Note optional. (Approving = consenting to the plan as written;
     the agent still re-verifies at live prices before executing — if the
     world moved, it cancels and tells you.)
   - **REJECT** — note REQUIRED. Your rejection reasons are training data;
     "no, because X" makes the system better, "no" doesn't.
   - **CHALLENGE** — you're not convinced; ask the question. The ticket
     freezes; tomorrow's run must answer your challenge in a written
     artifact before it can return to the queue. Use this liberally —
     challenging assumptions is your highest-value activity.
4. Red banner (halt/breaker/reconcile mismatch)? That outranks everything:
   read the linked post-mortem or event, acknowledge only when you've
   actually read it (your ack is a governance step, not a dismissal).

## 2. Your Authority — and Its Edges

You CAN: approve/reject/challenge anything; halt trading with one action
(it sticks until you lift it); override rules (Art VII — in writing, on the
platform, recorded with the AI's dissent and scored monthly; budget: 2/mo,
none in drawdown > 5% once that amendment lands).
You CANNOT (by design, not by trust): edit artifacts, edit history, approve
from the agent's credential, or make the AI skip its pipeline ("just buy
it" is not a thing this system can do — that's the feature you bought).
The AI CANNOT: execute unapproved trades, exceed approved size, re-submit a
rejected ticket unchanged, or act while a halt is unacknowledged.

## 3. Reading the Platform Honestly

- **Confidence chips** are calibration-aware: a role at 0.74 calibration
  showing "80%" means historically that's a 65–70% claim. Trust the
  discounted number.
- **n < 20 overlays**: metrics refusing to render conclusions aren't
  broken — they're refusing to lie to you with small samples.
- **/improvement's missed-opportunities panel** will sting. It exists so
  regret gets accounted, not acted on impulsively. A missed winner that
  scored 74 is the system WORKING (it was below the bar), not a bug.
- **Paper watermark**: while it shows, every P&L number is rehearsal.

## 4. Weekly (15 min, weekend)

/performance (adherence first, returns second — violations are the real
red flag) · /lessons (anything escalated to 3×?) · /agents (calibration
drifting? critic kill-rate near zero = rubber-stamping) · /improvement
(top backlog item — approve work on it or consciously defer).

## 5. Quarterly (1 hour)

The pipeline produces the quarterly review (walk-forward, validation
verdicts, calibration report, red-team results, amendment proposals).
Your job: read the proposals, approve at most 2 (the change-control cap),
sign the review, confirm the restore drill ran. If the benchmark gate
recommends firing the strategy and indexing — take that recommendation
seriously; the system is designed to be honest enough to say it, and you
hired it for exactly that honesty.

## 6. Incident Quick Cards

| You see | It means | You do |
|---|---|---|
| INGEST_MISSED 9:20 | pipeline didn't run/report | trigger manual run from your machine ("run the daily session"); positions are stop-protected regardless |
| RECONCILE_MISMATCH | DB ≠ git or local ≠ broker | don't approve anything; run reconciliation session; ack after reading the diff |
| Breaker banner (−8%) | satellites flattened, cooldown | read post-mortem → ack → expect half-risk resumption |
| Hard floor (−15%) | everything closed, back to paper | full paper gate + your written re-authorization required |
| Hash chain ✗ | an artifact changed after the fact | treat as incident: nothing approved until explained in writing |
| Approval expired 15:30 | approved but unexecuted ticket lapsed | normal safety behavior; it returns tomorrow if still valid |

## 7. Credentials & Hygiene

Passkey + TOTP; rotate INGEST_SECRET/AGENT_TOKEN quarterly (procedure:
update Vercel env + agent env in one sitting; the ingest retry queue
absorbs the gap). New device login alerts come to you — if you didn't log
in, halt trading first, investigate second. The website holds no broker
credentials; your Robinhood security is separate and stays that way.

## 8. The Operator's Creed (the short version of everything)

Process over outcome. Gray is good. Reject with reasons. Challenge often.
Read the bear case first. Never approve through a red banner. The system
is allowed to bore you — it is not allowed to surprise you.
