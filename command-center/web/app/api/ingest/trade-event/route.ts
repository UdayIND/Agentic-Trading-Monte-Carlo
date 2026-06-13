import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { ingestBody, ok, err } from "@/lib/api";
import { TradeEventIn, LEGAL_TRANSITIONS } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const r = await ingestBody(req, TradeEventIn);
  if (!r.ok) return r.res;
  const d = r.data;
  const trade = await db.trade.findUnique({ where: { id: d.tradeId } });
  if (!trade) return err("unknown tradeId", 404);

  // enforce legal state machine when the agent asserts a status change
  if (d.newStatus && d.newStatus !== trade.status) {
    const legal = LEGAL_TRANSITIONS[trade.status] ?? [];
    if (!legal.includes(d.newStatus)) {
      await db.systemEvent.create({ data: { kind: "ILLEGAL_TRANSITION", severity: "warn",
        payload: { tradeId: d.tradeId, from: trade.status, to: d.newStatus } } });
      return err(`illegal transition ${trade.status} -> ${d.newStatus}`, 409);
    }
  }

  await db.tradeEvent.create({ data: { tradeId: d.tradeId, type: d.type, payload: (d.payload ?? undefined) as Prisma.InputJsonValue | undefined } });
  await db.trade.update({
    where: { id: d.tradeId },
    data: {
      status: d.newStatus ?? undefined,
      realizedR: d.realizedR ?? undefined, realizedUsd: d.realizedUsd ?? undefined,
      closeReason: d.closeReason ?? undefined,
      openedAt: d.type === "EXECUTED" ? new Date() : undefined,
      closedAt: d.type === "CLOSED" ? new Date() : undefined,
    },
  });
  return ok({ recorded: d.type });
}
