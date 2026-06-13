import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ev = await db.systemEvent.findUnique({ where: { id } });
  if (!ev) return err("unknown event", 404);
  await db.systemEvent.update({ where: { id }, data: { acknowledgedAt: new Date() } });
  await db.operatorAction.create({ data: { kind: "HALT_ACK", note: `ack ${ev.kind}` } });
  return ok({ acknowledged: id });
}
