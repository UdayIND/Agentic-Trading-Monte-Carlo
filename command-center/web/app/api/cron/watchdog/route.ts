import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, requireCron } from "@/lib/api";

export const runtime = "nodejs";

// Runs twice (13:20 + 14:20 UTC) for DST; no-op unless wall-clock ET ~ 9:20.
function isNineTwentyET(now = new Date()): boolean {
  const et = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "numeric", hour12: false });
  const parts = Object.fromEntries(et.formatToParts(now).map((p) => [p.type, p.value]));
  return parts.hour === "9" && Number(parts.minute) >= 15 && Number(parts.minute) <= 35;
}

export async function POST(req: NextRequest) {
  const denied = requireCron(req);
  if (denied) return denied;
  if (!isNineTwentyET()) return ok({ skipped: "not 9:20 ET" });

  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  const run = await db.run.findFirst({ where: { date: today, type: "DAILY" } });
  const satisfied = run && (run.status === "COMPLETE" || run.status === "HOLIDAY");
  if (!satisfied) {
    await db.systemEvent.create({ data: { kind: "INGEST_MISSED", severity: "critical",
      payload: { date: today.toISOString().slice(0, 10), foundStatus: run?.status ?? "none" } } });
    return ok({ alert: "INGEST_MISSED" });
  }
  return ok({ healthy: true, runStatus: run.status });
}
