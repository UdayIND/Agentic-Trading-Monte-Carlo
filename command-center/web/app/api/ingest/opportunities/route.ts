import { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { ingestBody, ok, err } from "@/lib/api";
import { OpportunityIn } from "@/lib/schemas";

export const runtime = "nodejs";

const Body = z.object({ runId: z.string(), rows: z.array(OpportunityIn) });

export async function POST(req: NextRequest) {
  const r = await ingestBody(req, Body);
  if (!r.ok) return r.res;
  const { runId, rows } = r.data;
  const run = await db.run.findUnique({ where: { id: runId } });
  if (!run) return err("unknown runId", 404);
  // replace this run's opportunity set (idempotent re-ingest)
  await db.opportunity.deleteMany({ where: { runId } });
  await db.opportunity.createMany({
    data: rows.map((o) => ({
      runId, ticker: o.ticker, sector: o.sector, marketCapBand: o.marketCapBand,
      convictionPre: o.convictionPre, convictionPost: o.convictionPost ?? null,
      components: o.components as Prisma.InputJsonValue, band: o.band, playbook: o.playbook,
      catalyst: o.catalyst ?? null, expectedR: o.expectedR ?? null,
      target: o.target ?? null, stop: o.stop ?? null,
      inclusionReasons: o.inclusionReasons, exclusionReasons: o.exclusionReasons,
      status: o.status, tradeId: o.tradeId ?? null,
    })),
  });
  return ok({ count: rows.length });
}
