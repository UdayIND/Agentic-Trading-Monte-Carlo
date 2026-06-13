import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, requireAgent } from "@/lib/api";

export const runtime = "nodejs";

// The agent polls this to learn what the OPERATOR approved. It can read
// approvals + challenges; it can never create them. (Privilege separation.)
export async function GET(req: NextRequest) {
  const denied = requireAgent(req);
  if (denied) return denied;

  const approved = await db.trade.findMany({
    where: { status: "APPROVED" },
    select: {
      id: true, ticker: true, playbook: true, entryPlan: true, stop: true,
      target1: true, target2: true, shares: true, riskUsd: true, expectedR: true, planRunId: true,
    },
  });
  // operator challenges the next pipeline run must answer
  const challenges = await db.operatorAction.findMany({
    where: { kind: "CHALLENGE" },
    orderBy: { at: "desc" }, take: 20,
    select: { id: true, tradeId: true, note: true, at: true },
  });
  return ok({ approved, challenges });
}
