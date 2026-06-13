# VERCEL DEPLOYMENT (v6)

## 1. Projects & Environments
- GitHub private repo `agentic-trading-command-center` (separate from the
  strategy repo; the strategy repo stays the artifact ground truth).
- Vercel project linked to it. Environments: **Production** (main),
  **Preview** (PRs — seeded with synthetic data, NEVER production DB),
  **Development** (local, `vercel dev` + local Postgres).
- Database: Neon Postgres via Vercel integration; branch databases for
  previews (Neon branching) so preview deploys can't touch real records.

## 2. Environment Variables (per environment, never in code)
`DATABASE_URL` · `INGEST_SECRET` (HMAC) · `AGENT_TOKEN` · `CRON_SECRET` ·
`NEXTAUTH_SECRET` + passkey/TOTP config · `BLOB_READ_WRITE_TOKEN` ·
`ALERT_WEBHOOK` (Resend/ntfy) · `GITHUB_TOKEN` (read-only, for hash
reconciliation against the strategy repo). Rotation: quarterly, and
immediately on any anomaly; rotation procedure documented in OPERATOR_MANUAL.

## 3. vercel.json (essentials)
```json
{
  "crons": [
    { "path": "/api/cron/watchdog",  "schedule": "20 13 * * 1-5" },
    { "path": "/api/cron/watchdog",  "schedule": "20 14 * * 1-5" },
    { "path": "/api/cron/rollup",    "schedule": "30 21 * * 1-5" },
    { "path": "/api/cron/reconcile", "schedule": "0 2 * * *" },
    { "path": "/api/cron/backup",    "schedule": "0 3 * * *" }
  ]
}
```
(Duplicate watchdog = the UTC/DST workaround; handlers no-op when wall-clock
ET ≠ 9:20. All cron routes verify `CRON_SECRET`.)

## 4. CI/CD Gates (GitHub Actions before Vercel build)
typecheck (strict) · eslint · `prisma validate` + migration drift check ·
unit tests on `lib/metrics.ts` (golden-file tests: known equity curve →
known Sharpe/DD; the deterministic-math doctrine applies to the platform
too) · Zod schema round-trip tests · no-UPDATE-trigger migration test.
Production deploys from main only; PRs require the checks green.

## 5. Migration & Release Discipline
`prisma migrate` files committed; **no `db push` against production** —
migrations only, applied via CI step with `prisma migrate deploy`.
Backward-compatible ingest changes only (the agent may lag a version):
additive fields, never renamed/removed without a 2-version deprecation.
Release tags `cc-vX.Y.Z`; the ingest payload carries the agent's expected
schema version — mismatch logs a SystemEvent rather than 500ing.

## 6. Backup Strategy (three layers, matching the permanence rule)
1. Neon PITR (point-in-time recovery, 7–30 days) — operational mistakes.
2. Nightly `pg_dump` via /api/cron/backup → Vercel Blob, 90-day retention,
   weekly automated restore-verification into a scratch Neon branch
   (a backup that has never been restored is a hypothesis — standing rule).
3. git: the strategy repo holds canonical artifacts independently; the
   nightly OperatorAction/Decision JSON export commits platform-only data
   back to git. Full-loss recovery = redeploy from repo + restore dump +
   replay missing days from git artifacts via ingest (idempotent).

## 7. Security Posture (deployment-level)
All routes behind auth middleware except /api/ingest/* (HMAC), /api/agent/*
(token), /api/cron/* (secret). Security headers (CSP, no-sniff, frame-deny)
via next.config. Vercel Deployment Protection ON for previews. No analytics
or third-party scripts — this dashboard's audience is one person and an
auditor. Logs scrubbed of secrets by pino redact config.

## 8. Cost Envelope (honesty for a $1k account)
Vercel Hobby/Pro + Neon free tier + Blob ≈ $0–25/mo. The platform must
never cost more per month than the account's risk-per-trade tier would
justify; revisit at the $10k scaling checkpoint (the roadmap's
infrastructure clauses take over from there).
