import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ingestBody, ok } from "@/lib/api";
import { CalibrationIn } from "@/lib/schemas";

export const runtime = "nodejs";

const Body = z.object({ rows: z.array(CalibrationIn) });

export async function POST(req: NextRequest) {
  const r = await ingestBody(req, Body);
  if (!r.ok) return r.res;
  for (const c of r.data.rows) {
    await db.calibrationClaim.upsert({
      where: { claimId: c.claimId },
      create: {
        date: new Date(c.date), role: c.role, claimId: c.claimId, claimText: c.claimText,
        confidence: c.confidence, resolvableBy: c.resolvableBy ? new Date(c.resolvableBy) : null,
        resolvedAt: c.resolvedAt ? new Date(c.resolvedAt) : null, outcome: c.outcome ?? null,
      },
      update: { resolvedAt: c.resolvedAt ? new Date(c.resolvedAt) : undefined, outcome: c.outcome ?? undefined },
    });
  }
  return ok({ count: r.data.rows.length });
}
