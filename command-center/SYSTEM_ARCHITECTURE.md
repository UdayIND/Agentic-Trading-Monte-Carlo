# SYSTEM ARCHITECTURE (v6) — Agentic Trading Command Center

## 1. The One Load-Bearing Decision

**The web platform never holds broker credentials and never places orders.**
It is the system of record for *research, recommendations, approvals, and
audit* — not for execution. The AI pipeline (Claude + Robinhood MCP) runs
agent-side and pushes signed artifacts to the platform; execution happens
agent-side only after platform approval. Consequences:
- A full compromise of the website cannot move money.
- Operator authority is structural: the execution path physically requires
  a row in the `Approval` table that only the operator's authenticated
  session can create.
- The dashboard works even when the trading agent is offline (read path is
  independent).

## 2. Topology

```
┌──────────────────────────────┐         ┌─────────────────────────────────┐
│  AGENT SIDE (local / Claude  │  HTTPS  │  VERCEL (command center)        │
│  Code scheduled routine)     │  HMAC   │                                 │
│  • 9:00 ET pipeline run      ├────────►│  /api/ingest/* (signed writes)  │
│  • Robinhood MCP (quotes,    │         │  Next.js App Router UI          │
│    portfolio, orders)        │◄────────┤  /api/agent/pending (poll:      │
│  • git repo = artifact       │  poll   │   approvals awaiting execution) │
│    ground truth              │         │  Postgres (Neon) + Prisma       │
│  • executes APPROVED tickets │         │  Vercel Cron (watchdog+rollups) │
│    after Stage-6 verify      │         │  Blob storage (artifact copies) │
└──────────────────────────────┘         └─────────────────────────────────┘
                 │                                      ▲
                 └── git push (private remote) ─────────┘ (commit SHA recorded per run)
```

## 3. Source-of-Truth Contract (explicit, to prevent drift)

| Domain | System of record | Mirror |
|---|---|---|
| Artifacts (reports, cases, plans) | git repo (files, hashed) | Postgres `Artifact` (content + sha256 + commit) |
| Workflow state (pending/approved/rejected) | **Postgres** | reflected back into run artifacts |
| Approvals & operator actions | **Postgres** (only the platform can create) | exported nightly to git as JSON |
| Positions/cash/fills | **the broker** | Postgres snapshots (labeled as snapshots) |
| Metrics | computed from Postgres mirrors by platform code (deterministic TS, not LLM) | — |
Reconciliation job (cron, nightly): DB artifact hashes vs git; broker
snapshot vs positions table; any mismatch → banner on dashboard + alert.

## 4. Stack

Next.js 15 (App Router, RSC) · TypeScript strict · Tailwind + shadcn/ui ·
Prisma → Postgres (Neon, PITR enabled) · Vercel hosting + Cron · Vercel
Blob (artifact file copies) · pino structured logs → Vercel Log Drain
(Axiom) · NextAuth (passkey + TOTP, single operator) · Zod on every API
boundary · GitHub private repo, protected main, CI (typecheck, lint,
prisma validate, schema-drift check).

## 5. Folder Structure

```
command-center/app/
  (dashboard)/page.tsx            # Section 1 home
  market/  opportunities/  trade/[id]/  portfolio/  performance/
  lessons/  audit/[date]/  agents/  capital-flows/  improvement/
  approvals/                      # operator queue (Section 14)
  api/
    ingest/{run,artifact,decision,signals,positions}/route.ts   # HMAC writes
    agent/pending/route.ts        # signed poll: approved-not-executed
    trades/[id]/{approve,reject,challenge}/route.ts             # operator only
    cron/{watchdog,rollup,reconcile,backup}/route.ts
    {dashboard,market,opportunities,portfolio,performance,
     lessons,audit,agents,capital-flows,improvement}/route.ts   # reads
  lib/{db,auth,hmac,metrics,zod-schemas,logger}.ts
  prisma/schema.prisma
```

## 6. Security Model

- **AuthN**: single operator; passkey primary, TOTP fallback; session 24h.
  Entire site behind auth (no public pages — this is a financial journal).
- **Write paths**: ingest endpoints require HMAC-SHA256 over body with
  shared secret (env: INGEST_SECRET) + timestamp (±5 min window) +
  idempotency key (run_id) — replay-safe, duplicate-safe.
- **Approval paths**: operator session only; CSRF-protected; every action
  writes an immutable `OperatorAction` row (who/what/when/note).
- **Immutability**: `Artifact.sha256` + `prevHash` chain per run (tamper-
  evident); UPDATE forbidden by convention + Postgres trigger — corrections
  are new versions referencing the old.
- **The agent's poll credential** (`AGENT_TOKEN`) can READ pending
  approvals and WRITE execution reports — it cannot approve. Privilege
  separation between the entity that recommends and the entity that
  consents is the entire point.

## 7. Observability

Structured JSON logs (pino): every API call, ingest, approval, cron run
with request IDs. Dashboard `SystemHealth` widget: last ingest time, last
reconcile result, cron watchdog status, artifact-hash-chain verification.
Alerts (email/push via Resend or ntfy): missed 9:20 ingest, reconcile
mismatch, failed cron, login from new device.

## 8. What This Does NOT Do (scope fences)

No order placement, no broker keys, no live websocket market data (the
agent supplies snapshots; this is a decision platform, not a quote
terminal), no multi-tenant features, no public sharing. Future automation
(Section 11's "or through future automation") slots in as: approval row →
agent executes — the same handshake, shorter human latency; the consent
step never disappears.
