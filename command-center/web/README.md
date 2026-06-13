# Agentic Trading Command Center

Operator interface for the AI trading system. Next.js 15 + TypeScript +
Tailwind + Prisma/Postgres. **The platform never holds broker credentials
and never places orders** — it ingests the agent's research, lets the
operator approve/reject/challenge, and serves the audit trail. Execution
stays agent-side, gated on an operator approval row only an authenticated
session can create.

## Local development

```bash
# 1. Postgres (Docker)
docker run -d --name cc-postgres -e POSTGRES_PASSWORD=devpass \
  -e POSTGRES_DB=command_center -p 5544:5432 postgres:16

# 2. Env + deps
cp .env.example .env          # the committed .env already points at :5544 for dev
npm install
npx prisma migrate dev        # creates tables
npm run db:seed               # loads the real 2026-06-12 run + a demo pending trade

# 3. Run
npm run dev                   # http://localhost:3000  (login: OPERATOR_PASSWORD from .env)
```

Verify the operator loop: log in → `/approvals` → approve the demo NVDA
trade → it appears in `GET /api/agent/pending` (with the AGENT_TOKEN). The
agent token alone cannot approve (401) — that is the authority boundary.

## Deploy to Vercel

The repo root is the trading system; **this app lives in `command-center/web`**,
so the Vercel project's Root Directory MUST point there or you get a 404.

1. **Vercel project** → Import `UdayIND/Agentic-Trading-Monte-Carlo`.
   In **Settings → Build & Deployment → Root Directory**, set
   **`command-center/web`** (this is the #1 cause of a blank 404).
2. **Database**: create a Neon Postgres (Vercel → Storage → Neon). Copy its
   pooled connection string (`...?sslmode=require`). Enable PITR.
3. **Env vars** (Settings → Environment Variables), generate secrets with
   `openssl rand -hex 32`:
   `DATABASE_URL` (Neon), `INGEST_SECRET`, `AGENT_TOKEN`, `CRON_SECRET`,
   `SESSION_SECRET`, `OPERATOR_PASSWORD`, `NEXT_PUBLIC_PHASE=paper`.
   (Vercel auto-sends `Authorization: Bearer $CRON_SECRET` to cron routes.)
4. **Deploy / Redeploy.** The build runs `prisma migrate deploy`
   automatically, so a fresh Neon DB gets its schema on first deploy — no
   manual migrate step. (If `DATABASE_URL` is missing the build fails fast
   with a clear Prisma error — that's intended.)
5. **Seed (optional)**, to see the demo data: run `npm run db:seed` locally
   with the prod `DATABASE_URL` in `.env`. Skip for a clean production start.

Crons in `vercel.json` (watchdog 9:20 ET ×2 for DST, rollup) activate on
deploy. **Note:** the build runs migrations against whatever `DATABASE_URL`
is set per-environment — use a separate Neon branch DB for Preview so PRs
never migrate production.

## Connecting the agent

The 9:00 ET pipeline (Claude Code scheduled routine) runs research,
commits artifacts to git, then:

```bash
export CC_URL=https://your-cc.vercel.app CC_INGEST_SECRET=<INGEST_SECRET>
python3 ../../tools/ingest_push.py --run-dir runs/$(date +%F) \
  --date $(date +%F) --regime BULL_VOLATILE --phase 1_paper \
  --commit $(git rev-parse HEAD)
```

After the operator approves on the dashboard, the next agent session polls
`GET /api/agent/pending` (Bearer `AGENT_TOKEN`), re-verifies at live prices
(Stage 6), executes via the Robinhood MCP, and reports back via
`POST /api/ingest/trade-event`.

## Auth model (MVP vs roadmap)

MVP is a single strong password → HMAC-signed session cookie (Web Crypto,
Edge-compatible). **Roadmap**: WebAuthn passkey + TOTP (the spec's target).
The single-operator threat model is accepted for v1; the upgrade is
additive (swap `lib/auth.ts` + add a credentials table).

## Architecture notes

- Money fields are `Float` at this account scale (documented deviation from
  the Decimal spec; revisit at the $10k tier).
- Metrics are computed in `lib/metrics.ts` (TWR, flow-adjusted DD) and
  golden-file tested — never ingested from model prose.
- Trade status transitions are enforced server-side (`LEGAL_TRANSITIONS`);
  illegal transitions return 409 and log a `SystemEvent`.
- Order-path artifacts reject Tier-4 sources at the Zod boundary.
- Append-only audit tables (Artifact, TradeEvent, OperatorAction, Decision)
  by convention + re-ingest idempotency; add Postgres triggers before live.

## Roadmap (not in MVP)

Passkey/TOTP · reconcile + backup cron handlers (Neon PITR covers backups
now) · Blob artifact copies · per-window metric snapshots · missed-
opportunity/false-positive accounting (needs resolved trades) · Decimal
money fields · DB-trigger immutability.
