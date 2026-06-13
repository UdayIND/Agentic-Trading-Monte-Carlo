import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ingestBody, ok } from "@/lib/api";
import { RunIn } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const r = await ingestBody(req, RunIn);
  if (!r.ok) return r.res;
  const d = r.data;
  // idempotent on (date, type): upsert
  const run = await db.run.upsert({
    where: { date_type: { date: new Date(d.date), type: d.type } },
    create: {
      date: new Date(d.date), type: d.type, status: d.status,
      startedAt: new Date(d.startedAt), finishedAt: d.finishedAt ? new Date(d.finishedAt) : null,
      modelVersion: d.modelVersion, gitCommit: d.gitCommit ?? null, phase: d.phase, regime: d.regime,
    },
    update: {
      status: d.status, finishedAt: d.finishedAt ? new Date(d.finishedAt) : null,
      gitCommit: d.gitCommit ?? undefined, regime: d.regime,
    },
  });
  return ok({ runId: run.id });
}
