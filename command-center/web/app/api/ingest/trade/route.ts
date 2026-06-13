import { NextRequest } from "next/server";
import { ArtifactKind } from "@prisma/client";
import { db } from "@/lib/db";
import { ingestBody, ok, err } from "@/lib/api";
import { TradeIn } from "@/lib/schemas";

export const runtime = "nodejs";

// Agent creates a trade only once its order-path artifacts exist on the run.
// Lands directly in PENDING_APPROVAL so the operator can act.
export async function POST(req: NextRequest) {
  const r = await ingestBody(req, TradeIn);
  if (!r.ok) return r.res;
  const d = r.data;
  const required: ArtifactKind[] = [ArtifactKind.BULL, ArtifactKind.BEAR, ArtifactKind.RISK, ArtifactKind.TRADE_PLAN, ArtifactKind.QUALITY];
  const have = await db.artifact.findMany({
    where: { runId: d.planRunId, kind: { in: required } },
    select: { kind: true },
  });
  const kinds = new Set(have.map((h) => h.kind));
  const missing = required.filter((k) => !kinds.has(k));
  if (missing.length) return err(`cannot submit for approval; missing artifacts: ${missing.join(", ")}`, 422);

  const trade = await db.trade.create({
    data: {
      ticker: d.ticker, status: "PENDING_APPROVAL", thesis: d.thesis, playbook: d.playbook,
      entryPlan: d.entryPlan, stop: d.stop, target1: d.target1, target2: d.target2 ?? null,
      exitLogic: d.exitLogic, holdingPeriodDays: d.holdingPeriodDays, shares: d.shares,
      riskUsd: d.riskUsd, maxLossUsd: d.maxLossUsd, expectedRewardUsd: d.expectedRewardUsd,
      expectedR: d.expectedR, planRunId: d.planRunId,
      events: { create: [{ type: "IDEA" }, { type: "SUBMITTED" }] },
    },
  });
  return ok({ tradeId: trade.id });
}
