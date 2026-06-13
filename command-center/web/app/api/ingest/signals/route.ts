import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ingestBody, ok } from "@/lib/api";
import { SignalIn } from "@/lib/schemas";

export const runtime = "nodejs";

const Body = z.object({ rows: z.array(SignalIn) });

export async function POST(req: NextRequest) {
  const r = await ingestBody(req, Body);
  if (!r.ok) return r.res;
  let added = 0;
  for (const s of r.data.rows) {
    // dedupe on (actor, ticker, eventAt, txType)
    await db.capitalFlowSignal.upsert({
      where: { actor_ticker_eventAt_txType: { actor: s.actor, ticker: s.ticker, eventAt: new Date(s.eventAt), txType: s.txType } },
      create: {
        observedAt: new Date(s.observedAt), eventAt: new Date(s.eventAt), sourceClass: s.sourceClass,
        actor: s.actor, ticker: s.ticker, txType: s.txType, sizeUsd: s.sizeUsd ?? null,
        priceAtObservation: s.priceAtObservation ?? null, verified: s.verified, cfs: s.cfs ?? null,
      },
      update: { verified: s.verified, cfs: s.cfs ?? null },
    });
    added++;
  }
  return ok({ processed: added });
}
