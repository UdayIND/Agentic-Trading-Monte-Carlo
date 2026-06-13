import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/api";

export const runtime = "nodejs";

// Challenge freezes the ticket (stays PENDING_APPROVAL) and records a
// question the next pipeline run must answer in writing before it returns.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = z.object({ note: z.string().min(1, "challenge question required") }).safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 422);

  const trade = await db.trade.findUnique({ where: { id } });
  if (!trade) return err("unknown trade", 404);

  await db.tradeEvent.create({ data: { tradeId: id, type: "CHALLENGED", payload: { question: parsed.data.note } } });
  await db.operatorAction.create({ data: { tradeId: id, kind: "CHALLENGE", note: parsed.data.note } });
  return ok({ status: "CHALLENGED", note: "ticket frozen pending pipeline response" });
}
