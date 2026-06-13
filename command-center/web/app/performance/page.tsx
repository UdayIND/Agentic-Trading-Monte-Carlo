import { db } from "@/lib/db";
import { inceptionMetrics } from "@/lib/queries";
import { EquityChart } from "@/components/EquityChart";
import { ThresholdMetric, PaperWatermark } from "@/components/ui";
import { num, pct } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PerformancePage() {
  const [points, m] = await Promise.all([
    db.equityPoint.findMany({ orderBy: { date: "asc" } }),
    inceptionMetrics(),
  ]);
  const chart = points.map((p) => ({ date: p.date.toISOString().slice(0, 10), equity: p.equity, qqq: p.qqqClose }));
  const enoughTrades = m.closedTrades >= 20;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold flex items-center gap-2">Performance <PaperWatermark /></h1>

      <div className="border border-zinc-800 rounded-lg p-3 bg-zinc-950">
        <div className="text-xs text-zinc-500 mb-1">EQUITY CURVE vs QQQ</div>
        <EquityChart points={chart} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="border border-zinc-800 rounded-lg p-3">
          <div className="text-xs text-zinc-500 mb-2">METRICS vs THRESHOLDS</div>
          <ThresholdMetric label="Sharpe" value={m.sharpe != null ? num(m.sharpe) : "n<60d"} threshold="≥0.5" ok={m.sharpe == null ? null : m.sharpe >= 0.5} />
          <ThresholdMetric label="Sortino" value={m.sortino != null ? num(m.sortino) : "n<60d"} threshold="≥0.8" ok={m.sortino == null ? null : m.sortino >= 0.8} />
          <ThresholdMetric label="Win rate" value={enoughTrades ? pct(m.winRate) : "n<20"} threshold="≥35%" ok={enoughTrades ? (m.winRate ?? 0) >= 0.35 : null} />
          <ThresholdMetric label="Expectancy" value={enoughTrades ? `${num(m.expectancyR)}R` : "n<20"} threshold="≥0.10R" ok={enoughTrades ? (m.expectancyR ?? 0) >= 0.10 : null} />
          <ThresholdMetric label="Profit factor" value={enoughTrades ? num(m.profitFactor) : "n<20"} threshold="≥1.2" ok={enoughTrades ? (m.profitFactor ?? 0) >= 1.2 : null} />
          <ThresholdMetric label="Max drawdown" value={pct(m.maxDrawdown)} threshold="≤15%" ok={m.maxDrawdown == null ? null : m.maxDrawdown <= 0.15} />
        </div>
        <div className="border border-zinc-800 rounded-lg p-3">
          <div className="text-xs text-zinc-500 mb-2">SUMMARY</div>
          <div className="text-sm space-y-1 mono">
            <div>CAGR (TWR): {m.cagr != null ? pct(m.cagr) : "—"}</div>
            <div>Total TWR: {m.twrTotal != null ? pct(m.twrTotal) : "—"}</div>
            <div>Current drawdown: {pct(m.currentDrawdown)}</div>
            <div>Avg exposure: {pct(m.avgExposure, 0)}</div>
            <div>Closed trades: {m.closedTrades}</div>
          </div>
          {m.insufficient.length > 0 && (
            <div className="mt-2 text-[11px] text-amber-500">
              {m.insufficient.map((s, i) => <div key={i}>⚠ {s}</div>)}
            </div>
          )}
        </div>
      </div>
      <div className="text-[11px] text-zinc-600">All figures computed deterministically from the equity curve and closed trades (lib/metrics.ts). The system refuses to report trade-level conclusions below n=20.</div>
    </div>
  );
}
