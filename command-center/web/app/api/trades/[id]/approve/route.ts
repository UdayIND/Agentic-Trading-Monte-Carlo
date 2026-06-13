import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/api";
// NOTE: operator session is enforced by middleware (cookie). Reaching this
// handler means the request is authenticated as the operator.

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const note = z.string().optional().parse(body?.note);

  // governance: cannot approve while an unacknowledged halt is active
  const halt = await db.systemEvent.findFirst({
    where: { severity: "critical", acknowledgedAt: null,
      kind: { in: ["BREAKER", "HARD_FLOOR", "RECONCILE_MISMATCH"] } },
  });
  if (halt) return err(`blocked: unacknowledged ${halt.kind} — acknowledge before approving`, 409);

  const trade = await db.trade.findUnique({ where: { id } });
  if (!trade) return err("unknown trade", 404);
  if (trade.status !== "PENDING_APPROVAL") return err(`trade is ${trade.status}, not PENDING_APPROVAL`, 409);

  await db.trade.update({ where: { id }, data: { status: "APPROVED" } });
  await db.tradeEvent.create({ data: { tradeId: id, type: "APPROVED", payload: note ? { note } : undefined } });
  await db.operatorAction.create({ data: { tradeId: id, kind: "APPROVE", note: note ?? null } });
  return ok({ status: "APPROVED" });
}
