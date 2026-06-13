# API SPEC (v6) — Routes, Auth, Contracts

Three privilege classes (never mixed on one route):
**OPERATOR** (session cookie, passkey/TOTP) · **AGENT** (Bearer AGENT_TOKEN)
· **INGEST** (HMAC-signed). All bodies validated with Zod; all responses
`{ ok, data | error, requestId }`. Errors: 400 invalid, 401/403 auth,
409 illegal state transition, 422 integrity (e.g., missing artifact set).

## 1. Ingest (agent → platform; HMAC + timestamp + idempotency)

| Route | Body (summary) | Notes |
|---|---|---|
| POST /api/ingest/run | run meta (date, type, modelVersion, gitCommit, phase, regime) | idempotent on (date,type); returns runId |
| POST /api/ingest/artifact | runId, kind, path, content, frontmatter, sha256, prevHash | hash verified server-side; mismatch = 422 |
| POST /api/ingest/decision | runId + Decision fields | one per run (unique) |
| POST /api/ingest/opportunities | runId, rows[] | full daily table incl. rejects |
| POST /api/ingest/positions | date, positions[] (incl. whyWeStillOwnThis), equityPoint | broker snapshot |
| POST /api/ingest/signals | CapitalFlowSignal rows[] | deduped on unique key |
| POST /api/ingest/agent-runs | AgentRun rows[] | per-pass records |
| POST /api/ingest/trade-event | tradeId, type, payload | execution reports, fills, closes |
| POST /api/ingest/calibration | claims[] / resolutions[] | |
| POST /api/ingest/lessons | upserts by lesson id | the one mutable mirror (file is truth) |

## 2. Agent handshake (agent → platform; AGENT_TOKEN)

| Route | Purpose |
|---|---|
| GET /api/agent/pending | trades in APPROVED not yet EXECUTED + any operator CHALLENGE items addressed to the pipeline |
| POST /api/agent/ack | agent confirms receipt of approval (writes TradeEvent SUBMITTED→acknowledged) |
**The agent token cannot approve, reject, or write OperatorActions — 403 by design.**

## 3. Operator actions (session auth + CSRF)

| Route | Effect |
|---|---|
| POST /api/trades/[id]/approve | PENDING_APPROVAL → APPROVED; OperatorAction row; note optional |
| POST /api/trades/[id]/reject | → REJECTED (note required — rejection reasons are data) |
| POST /api/trades/[id]/challenge | status unchanged; creates CHALLENGE item the next pipeline run must answer in writing |
| POST /api/system/ack/[eventId] | acknowledge halt/breaker/reconcile events (resumption prerequisite) |
| POST /api/notes | free-form operator note attached to run/trade/artifact |

## 4. Read APIs (operator session; power the pages)

| Route | Returns |
|---|---|
| GET /api/dashboard | Section-1 payload: latest Decision+confidence, regime, risk level (heat vs cap), cash %, portfolio value, open positions, realized/unrealized P&L, win rate, PF, maxDD, Sharpe, vs-QQQ — all from MetricSnapshot + EquityPoint + PositionSnapshot |
| GET /api/market/latest (+?date=) | intel report artifact parsed to sections + evidence blocks w/ tier+confidence |
| GET /api/opportunities?date&sector&band&minConviction&cap | filterable table |
| GET /api/trades/[id] | trade + plan + linked BULL/BEAR/RISK/QUALITY artifacts + full TradeEvent timeline + approvals |
| GET /api/portfolio | latest PositionSnapshots + whyWeStillOwnThis + aggregates |
| GET /api/performance?window | MetricSnapshots + chart series (equity, drawdown, monthly returns, R-multiples, win/loss histogram, heat) |
| GET /api/lessons?status&category | lessons + linked evidence |
| GET /api/audit/[date] | the full run: artifacts (ordered), evidence, agent passes, decision — the reconstruction view |
| GET /api/agents?window | per-role: last run, last verdict/confidence, veto count, disagreement count, calibration accuracy (from CalibrationClaim), critic kill-rate |
| GET /api/capital-flows?class&window | signals ranked by CFS; historical effectiveness (fwd-excess columns aggregated by sourceClass/actor) |
| GET /api/improvement | prediction/signal/conviction/agent accuracy series; missed-opportunity log (WATCH-band names that hit hypothetical targets); false-positive log (TRADABLE-band killed/blocked/stopped); top improvement candidates from IMPROVEMENT_BACKLOG mirror |
| GET /api/system/health | last ingest, watchdog, reconcile, hash-chain status |

## 5. Cron (Vercel; CRON_SECRET header)

| Route | Schedule (UTC) | Job |
|---|---|---|
| POST /api/cron/watchdog | 13:20 weekdays (9:20 ET; 14:20 in winter — see CRON_WORKFLOW DST note) | run ingested today? else SystemEvent INGEST_MISSED + alert |
| POST /api/cron/rollup | 21:30 weekdays | MetricSnapshots recompute; calibration resolutions due today; missed-opportunity scan |
| POST /api/cron/reconcile | 02:00 daily | DB↔git hash check (via GitHub API on recorded commits); position vs equity sanity |
| POST /api/cron/backup | 03:00 daily | pg_dump → Blob; verify restorability weekly |

## 6. Contracts Worth Pinning (Zod, shared `lib/zod-schemas.ts`)

`DecisionSchema` enums exactly BUY/SELL/HOLD/DO_NOTHING; `confidence` 0–100
int. `TradePlanSchema` requires all eleven fields non-null (matches the
template). `OpportunitySchema` requires `exclusionReasons` non-empty even
for rank 1 (the framework's honesty rule, enforced at the API boundary).
`EvidenceBlockSchema` rejects tier-4 sources attached to order-path
artifact kinds (422) — governance encoded as types.
