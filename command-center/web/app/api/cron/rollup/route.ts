import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, requireCron } from "@/lib/api";
import { computeMetrics, EquityRow, FlowRow, ClosedTrade } from "@/lib/metrics";

export const runtime = "nodejs";

// Nightly: recompute the inception metric snapshot from DB rows (deterministic).
export async function POST(req: NextRequest) {
  const denied = requireCron(req);
  if (denied) return denied;

  const points = await db.equityPoint.findMany({ orderBy: { date: "asc" } });
  const curve: EquityRow[] = points.map((p) => ({ date: p.date.toISOString().slice(0, 10), equity: p.equity, cash: p.cash }));
  const flows: FlowRow[] = []; // flows.csv ingest is agent-side; mirror is future work
  const closed = await db.trade.findMany({ where: { status: "CLOSED", realizedR: { not: null } } });
  const trades: ClosedTrade[] = closed.map((t) => ({ realizedR: t.realizedR!, realizedUsd: t.realizedUsd ?? 0 }));

  const m = computeMetrics(curve, flows, trades);
  const asOf = new Date(); asOf.setUTCHours(0, 0, 0, 0);
  await db.metricSnapshot.upsert({
    where: { asOf_window: { asOf, window: "INCEPTION" } },
    create: { asOf, window: "INCEPTION", cagr: m.cagr, sharpe: m.sharpe, sortino: m.sortino,
      profitFactor: m.profitFactor, expectancyR: m.expectancyR, winRate: m.winRate,
      maxDrawdown: m.maxDrawdown, exposurePct: m.avgExposure, trades: m.closedTrades },
    update: { cagr: m.cagr, sharpe: m.sharpe, sortino: m.sortino, profitFactor: m.profitFactor,
      expectancyR: m.expectancyR, winRate: m.winRate, maxDrawdown: m.maxDrawdown,
      exposurePct: m.avgExposure, trades: m.closedTrades },
  });
  return ok({ metrics: m });
}
