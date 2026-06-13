import Link from "next/link";
import { latestDecision, latestEquity, openPositions, inceptionMetrics, pendingApprovals, unackedCriticalEvents } from "@/lib/queries";
import { DecisionChip, Card, PaperWatermark, Money } from "@/components/ui";
import { pct, num, usd } from "@/lib/format";

export const dynamic = "force-dynamic";

function Kpi({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="border border-zinc-800 rounded-lg p-3 bg-zinc-950">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mono text-lg mt-0.5">{value}</div>
      {sub && <div className="text-[10px] text-zinc-500">{sub}</div>}
    </div>
  );
}

export default async function Home() {
  const [decision, equity, positions, m, pending, halts] = await Promise.all([
    latestDecision(), latestEquity(), openPositions(), inceptionMetrics(), pendingApprovals(), unackedCriticalEvents(),
  ]);
  const unrealized = positions.reduce((a, p) => a + p.plUsd, 0);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold flex items-center gap-2">Command Center <PaperWatermark /></h1>
        <span className="text-xs text-zinc-500 mono">{equity ? equity.date.toISOString().slice(0, 10) : "no data"}</span>
      </header>

      {halts.length > 0 && (
        <div className="border border-red-700 bg-red-950/40 rounded-lg p-3">
          <div className="text-red-300 text-sm font-semibold">⚠ {halts.length} unacknowledged critical event(s)</div>
          {halts.map((h) => (
            <div key={h.id} className="text-xs text-red-200 mt-1 flex justify-between">
              <span>{h.kind} — {h.at.toISOString().slice(0, 16).replace("T", " ")}Z</span>
              <Link href="/audit" className="underline">review</Link>
            </div>
          ))}
        </div>
      )}

      {/* Decision banner */}
      <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-900/60">
        {decision ? (
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500">TODAY</span>
              <DecisionChip d={decision.decision} />
              <span className="mono text-sm">{decision.confidence}% conf</span>
              <span className="text-sm text-zinc-300">{decision.reasoning.slice(0, 90)}…</span>
            </div>
            <div className="flex items-center gap-3">
              {pending.length > 0 && (
                <Link href="/approvals" className="px-2 py-1 rounded bg-amber-700 text-xs font-semibold animate-pulse">
                  {pending.length} PENDING APPROVAL
                </Link>
              )}
              <Link href={`/audit/${decision.date.toISOString().slice(0, 10)}`} className="text-xs underline text-zinc-400">full reasoning →</Link>
            </div>
          </div>
        ) : <div className="text-zinc-500 text-sm">No decision recorded yet.</div>}
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Regime" value={equity?.regime ?? "—"} />
        <Kpi label="Risk (heat)" value={equity ? pct(equity.heatPct / 100, 1) : "—"} sub="vs regime cap" />
        <Kpi label="Cash %" value={equity ? pct(equity.cash / equity.equity, 0) : "—"} />
        <Kpi label="Equity" value={equity ? usd(equity.equity) : "—"} />
        <Kpi label="Open positions" value={positions.length} />
        <Kpi label="Unrealized P&L" value={<Money v={unrealized} />} />
        <Kpi label="Win rate" value={m.closedTrades >= 20 ? pct(m.winRate) : "n<20"} sub={`${m.closedTrades} closed`} />
        <Kpi label="Profit factor" value={m.closedTrades >= 20 ? num(m.profitFactor) : "n<20"} />
        <Kpi label="Max drawdown" value={pct(m.maxDrawdown)} />
        <Kpi label="Sharpe" value={m.sharpe != null ? num(m.sharpe) : "n<60d"} />
        <Kpi label="CAGR (TWR)" value={m.cagr != null ? pct(m.cagr) : "—"} />
        <Kpi label="Exposure" value={pct(m.avgExposure, 0)} />
      </div>

      <Card title="SYSTEM HEALTH">
        <div className="text-xs text-zinc-400 mono flex gap-4 flex-wrap">
          <span>last data: {equity ? equity.date.toISOString().slice(0, 10) : "none"}</span>
          <span>positions reconciled: {positions.length}</span>
          <span>halts: {halts.length === 0 ? "✓ none" : `⚠ ${halts.length}`}</span>
          <span className="text-zinc-600">metrics computed deterministically (lib/metrics.ts)</span>
        </div>
      </Card>
    </div>
  );
}
