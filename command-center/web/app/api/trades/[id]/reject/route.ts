import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  // rejection reasons are training data — note is REQUIRED
  const parsed = z.object({ note: z.string().min(1, "rejection note required") }).safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 422);

  const trade = await db.trade.findUnique({ where: { id } });
  if (!trade) return err("unknown trade", 404);
  if (trade.status !== "PENDING_APPROVAL") return err(`trade is ${trade.status}`, 409);

  await db.trade.update({ where: { id }, data: { status: "REJECTED" } });
  await db.tradeEvent.create({ data: { tradeId: id, type: "REJECTED", payload: { note: parsed.data.note } } });
  await db.operatorAction.create({ data: { tradeId: id, kind: "REJECT", note: parsed.data.note } });
  return ok({ status: "REJECTED" });
}
