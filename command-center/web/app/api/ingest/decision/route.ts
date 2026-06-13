import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ingestBody, ok, err } from "@/lib/api";
import { DecisionIn } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const r = await ingestBody(req, DecisionIn);
  if (!r.ok) return r.res;
  const d = r.data;
  const run = await db.run.findUnique({ where: { id: d.runId } });
  if (!run) return err("unknown runId", 404);
  const decision = await db.decision.upsert({
    where: { runId: d.runId },
    create: {
      runId: d.runId, date: new Date(d.date), decision: d.decision, confidence: d.confidence,
      reasoning: d.reasoning, risks: d.risks, invalidation: d.invalidation, horizon: d.horizon, tickers: d.tickers,
    },
    update: {
      decision: d.decision, confidence: d.confidence, reasoning: d.reasoning,
      risks: d.risks, invalidation: d.invalidation, horizon: d.horizon, tickers: d.tickers,
    },
  });
  // mirror confidence into calibration ledger
  await db.calibrationClaim.upsert({
    where: { claimId: `DEC-${d.date}` },
    create: { date: new Date(d.date), role: "session_decision", claimId: `DEC-${d.date}`,
      claimText: d.reasoning.slice(0, 200), confidence: d.confidence },
    update: {},
  });
  return ok({ decisionId: decision.id });
}
