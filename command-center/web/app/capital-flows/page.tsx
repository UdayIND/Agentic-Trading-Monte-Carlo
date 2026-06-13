import { db } from "@/lib/db";
import { usd } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CapitalFlowsPage() {
  const signals = await db.capitalFlowSignal.findMany({ orderBy: [{ cfs: "desc" }, { observedAt: "desc" }], take: 100 });
  const byClass = (c: string) => signals.filter((s) => s.sourceClass === c);

  const Panel = ({ title, rows, badge }: { title: string; rows: typeof signals; badge?: string }) => (
    <div className="border border-zinc-800 rounded-lg p-3">
      <div className="text-xs text-zinc-500 mb-2">{title} {badge && <span className="text-amber-500">{badge}</span>}</div>
      {rows.length === 0 && <div className="text-xs text-zinc-600">No verified signals.</div>}
      {rows.map((s) => (
        <div key={s.id} className="text-xs mono flex justify-between border-b border-zinc-900 py-1">
          <span>{s.ticker} · {s.actor} · {s.txType}</span>
          <span className="text-zinc-400">{s.sizeUsd ? usd(s.sizeUsd) : ""} {s.cfs != null ? `CFS ${s.cfs}` : ""} {s.verified ? "✓" : "✗"}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-3">
      <h1 className="text-lg font-semibold">Capital Flow Center</h1>
      <p className="text-xs text-zinc-500">Evidence only — bounded conviction modifier, never an execution path. No source has permanent trust.</p>
      <div className="grid md:grid-cols-2 gap-3">
        <Panel title="INSIDER" rows={byClass("INSIDER")} />
        <Panel title="CONGRESS" rows={byClass("CONGRESS")} badge="⏱ up to 45d delay" />
        <Panel title="INSTITUTIONAL" rows={byClass("INSTITUTIONAL")} badge="⏱ as-of quarter-end" />
        <div className="border border-zinc-800 rounded-lg p-3">
          <div className="text-xs text-zinc-500 mb-2">EFFECTIVENESS (forward excess vs SPY)</div>
          {signals.filter((s) => s.fwdExcess3m != null).length === 0
            ? <div className="text-xs text-zinc-600">No resolved signals yet — validation runs quarterly.</div>
            : signals.filter((s) => s.fwdExcess3m != null).map((s) => (
              <div key={s.id} className="text-xs mono">{s.ticker}: 3m {(s.fwdExcess3m! * 100).toFixed(1)}%</div>
            ))}
        </div>
      </div>
    </div>
  );
}
