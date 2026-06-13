# IMPLEMENTATION PLAN — Building Everything (2026-06-12)

Scope: close all P0 debt (IB-1..6) and implement the v6 Command Center
(IB-8). Order is strict dependency order — each phase's output is the next
phase's foundation. Environment verified: Node 26, npm 11, git 2.50,
Docker 28, Python 3.14.

## Phase 0 — Git Foundation (IB-1) ✦ everything depends on this
- `git init`, `.gitignore` (node_modules, .next, .env*, drills/, __pycache__)
- Initial commit: all docs, state, runs, templates (tamper-evidence baseline)
- Remote: user adds private GitHub remote post-build (instructions in README)
- Done when: `git log` shows the baseline commit; every later phase commits.

## Phase 1 — Deterministic Tooling (IB-2,3,4,5,6) ✦ money-math out of prose
| Tool | Contract |
|---|---|
| `tools/runlock.py` | acquire/release/status; lock file with timestamp; 2h stale takeover |
| `tools/regime.py` | input: bars JSON (MCP output saved to file) → SMA200/50, 50-slope, 20d RV + percentile → regime code + posture row |
| `tools/guard.py` | input: ticket JSON + state + quotes/positions/orders/bars JSONs → recompute ATR/stop/shares/heat → every RISK_FRAMEWORK hard limit → PASS/FAIL(reason) |
| `tools/metrics.py` | input: equity_curve.csv + flows.csv + trades JSON/journal → TWR returns, flow-adjusted HWM/DD, Sharpe/Sortino/PF/expectancy/win-rate vs thresholds |
| `state/flows.csv` | append-only deposit/withdrawal ledger (IB-3) |
- Pure stdlib Python (no deps). `tools/tests/test_*.py` via unittest; all green.
- Done when: tests pass; agent workflow = save tool outputs to JSON → run script → read verdict.

## Phase 2 — Web App Scaffold (`command-center/web/`)
- Manual scaffold (no create-next-app churn): package.json (next@15, react,
  typescript, tailwind, prisma, @prisma/client, zod), tsconfig strict,
  tailwind config, Prisma schema per DATABASE_SCHEMA.md.
- `lib/`: db (Prisma singleton), hmac (sign/verify + timestamp window),
  auth (session cookie, OPERATOR_PASSWORD for MVP — passkey/TOTP upgrade
  path documented in README), zod-schemas (shared contracts), metrics
  (deterministic TS: Sharpe/DD/PF from EquityPoint+Trade rows), queries.
- Auth model note (deviation from spec, documented): MVP = strong password
  + httpOnly session cookie + middleware; NextAuth passkey+TOTP is a
  follow-up — single-operator risk accepted for v1.
- Done when: `npm install` clean, `prisma generate` clean, `tsc --noEmit` green.

## Phase 3 — API Routes (per API_SPEC.md)
- Ingest (HMAC + idempotency): run, artifact, decision, opportunities,
  positions, signals, agent-runs, trade-event, lessons, calibration.
- Agent handshake (Bearer AGENT_TOKEN): GET pending, POST ack.
- Operator (session): approve / reject (note required) / challenge,
  system ack. State machine enforced (409 on illegal transitions);
  approval requires BULL+BEAR+RISK+TRADE_PLAN+QUALITY artifacts (422).
- Cron (CRON_SECRET): watchdog (ET wall-clock check), rollup (metrics
  snapshots), reconcile stub (hash verification), backup note (Neon-side).
- Done when: routes typecheck; integration-tested against seeded DB in Phase 5.

## Phase 4 — UI (per DASHBOARD_SPEC / UI_WIREFRAMES)
13 routes, server components, dark terminal theme, PAPER watermark:
`/` (decision banner + KPI grid + health) · `/approvals` (the 9:20 screen)
· `/market` · `/opportunities` · `/trade/[id]` (tabs + timeline) ·
`/portfolio` ("why we still own this") · `/performance` (SVG charts,
n<20 overlays) · `/lessons` · `/audit` + `/audit/[date]` (reconstruction
view) · `/agents` · `/capital-flows` · `/improvement` · `/login`.
- Done when: every page renders against seed data without runtime errors.

## Phase 5 — Verification (real database)
- Docker: `postgres:16` container → `prisma migrate dev` → seed script
  loading the REAL 2026-06-12 run (intelligence report, decision,
  HANDOFF, equity point) + one synthetic PENDING_APPROVAL trade so the
  approvals loop is demonstrable end-to-end.
- `tsc --noEmit` + `next build` green. Manual smoke: ingest with valid/
  invalid HMAC, approve→agent-pending visibility, illegal transition 409.
- Done when: all green, committed.

## Phase 6 — Deployment Package
- `.env.example`, `vercel.json` (crons), README (Neon + Vercel deploy
  steps, secret generation, remote-git setup), `tools/ingest_push.py`
  (agent-side helper: posts a run directory to the ingest API with HMAC).
- CHANGELOG + CLAUDE.md + IMPROVEMENT_BACKLOG status updates. Final commit.
- NOT done by me (requires user accounts): Vercel project creation, Neon
  provisioning, GitHub remote, secrets. README §Deploy covers all four.

## Risk Notes
- Next 15/Prisma versions move fast: pin minor versions; build verified
  locally is the gate, not docs.
- SQLite is NOT used (Decimal/trigger semantics) — Postgres everywhere,
  Docker locally, Neon in prod.
- Scope discipline: MVP = operator loop (ingest → review → approve →
  agent poll) + audit views. Charts are functional SVG, not a charting
  framework. Anything cut is listed in README §Roadmap.
