import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ingestBody, ok } from "@/lib/api";
import { PositionsIn } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const r = await ingestBody(req, PositionsIn);
  if (!r.ok) return r.res;
  const { date, positions, equityPoint } = r.data;
  const d = new Date(date);
  for (const p of positions) {
    await db.positionSnapshot.upsert({
      where: { date_ticker: { date: d, ticker: p.ticker } },
      create: {
        date: d, ticker: p.ticker, shares: p.shares, costBasis: p.costBasis, price: p.price,
        plUsd: p.plUsd, stop: p.stop ?? null, target: p.target ?? null,
        conviction: p.conviction ?? null, whyWeStillOwnThis: p.whyWeStillOwnThis, tradeId: p.tradeId ?? null,
      },
      update: { price: p.price, plUsd: p.plUsd, stop: p.stop ?? null, whyWeStillOwnThis: p.whyWeStillOwnThis },
    });
  }
  await db.equityPoint.upsert({
    where: { date: d },
    create: { date: d, equity: equityPoint.equity, cash: equityPoint.cash, heatPct: equityPoint.heatPct, regime: equityPoint.regime, qqqClose: equityPoint.qqqClose ?? null },
    update: { equity: equityPoint.equity, cash: equityPoint.cash, heatPct: equityPoint.heatPct, qqqClose: equityPoint.qqqClose ?? null },
  });
  return ok({ positions: positions.length });
}
