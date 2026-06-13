import { db } from "@/lib/db";
import { computeMetrics, EquityRow, ClosedTrade } from "@/lib/metrics";

export async function latestDecision() {
  return db.decision.findFirst({ orderBy: { date: "desc" } });
}

export async function latestEquity() {
  return db.equityPoint.findFirst({ orderBy: { date: "desc" } });
}

export async function openPositions() {
  const latest = await latestEquity();
  if (!latest) return [];
  return db.positionSnapshot.findMany({ where: { date: latest.date }, orderBy: { ticker: "asc" } });
}

export async function pendingApprovals() {
  return db.trade.findMany({
    where: { status: "PENDING_APPROVAL" },
    include: { events: { orderBy: { at: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function unackedCriticalEvents() {
  return db.systemEvent.findMany({
    where: { severity: "critical", acknowledgedAt: null },
    orderBy: { at: "desc" },
  });
}

export async function inceptionMetrics() {
  const points = await db.equityPoint.findMany({ orderBy: { date: "asc" } });
  const curve: EquityRow[] = points.map((p) => ({ date: p.date.toISOString().slice(0, 10), equity: p.equity, cash: p.cash }));
  const closed = await db.trade.findMany({ where: { status: "CLOSED", realizedR: { not: null } } });
  const trades: ClosedTrade[] = closed.map((t) => ({ realizedR: t.realizedR!, realizedUsd: t.realizedUsd ?? 0 }));
  return computeMetrics(curve, [], trades);
}

export async function runForDate(dateStr: string) {
  const date = new Date(dateStr);
  return db.run.findFirst({
    where: { date, type: "DAILY" },
    include: {
      artifacts: { include: { evidence: true }, orderBy: { kind: "asc" } },
      decision: true,
      agentRuns: true,
      opportunities: { orderBy: { convictionPre: "desc" } },
    },
  });
}

export async function recentRuns(limit = 30) {
  return db.run.findMany({ orderBy: { date: "desc" }, take: limit, include: { decision: true } });
}

export async function calibrationByRole() {
  const claims = await db.calibrationClaim.findMany({ where: { outcome: { not: null } } });
  const byRole = new Map<string, { n: number; hits: number }>();
  for (const c of claims) {
    const e = byRole.get(c.role) ?? { n: 0, hits: 0 };
    e.n++; if (c.outcome) e.hits++;
    byRole.set(c.role, e);
  }
  return byRole;
}
