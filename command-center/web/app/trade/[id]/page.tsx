import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { num, usd } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function TradePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trade = await db.trade.findUnique({
    where: { id },
    include: { events: { orderBy: { at: "asc" } }, actions: { orderBy: { at: "asc" } } },
  });
  if (!trade) notFound();

  const arts = trade.planRunId
    ? await db.artifact.findMany({ where: { runId: trade.planRunId, kind: { in: ["BULL", "BEAR", "RISK", "TRADE_PLAN", "QUALITY", "POST_MORTEM"] } } })
    : [];
  const get = (k: string) => arts.find((a) => a.kind === k)?.content;

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-lg font-semibold">{trade.ticker} <span className="text-sm text-zinc-400">· {trade.status}</span></h1>
        <span className="mono text-xs text-zinc-500">{trade.playbook} · R {num(trade.expectedR)} · risk {usd(trade.riskUsd)}</span>
      </header>

      <div className="border border-zinc-800 rounded-lg p-3">
        <div className="text-xs text-zinc-500 mb-1">THESIS</div>
        <div className="text-sm text-zinc-200">{trade.thesis}</div>
        <div className="mono text-xs text-zinc-400 mt-2">
          entry {usd(trade.entryPlan)} · stop {usd(trade.stop)} · T1 {usd(trade.target1)}{trade.target2 ? ` · T2 ${usd(trade.target2)}` : ""} · max loss {usd(trade.maxLossUsd)} · hold ~{trade.holdingPeriodDays}d · exit: {trade.exitLogic}
        </div>
        {trade.realizedR != null && <div className="mono text-xs mt-1">realized: {num(trade.realizedR)}R ({usd(trade.realizedUsd)}) · {trade.closeReason}</div>}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {(["BULL", "BEAR", "RISK", "QUALITY", "TRADE_PLAN", "POST_MORTEM"] as const).map((k) => get(k) && (
          <div key={k} className="border border-zinc-800 rounded p-2">
            <div className="text-[10px] text-zinc-500 mb-1">{k.replace("_", " ")}</div>
            <pre className="text-xs whitespace-pre-wrap text-zinc-300 max-h-48 overflow-auto">{get(k)}</pre>
          </div>
        ))}
      </div>

      <div className="border border-zinc-800 rounded-lg p-3">
        <div className="text-xs text-zinc-500 mb-2">TIMELINE</div>
        <div className="space-y-1">
          {trade.events.map((e) => (
            <div key={e.id} className="text-xs mono flex gap-3">
              <span className="text-zinc-500 w-32 shrink-0">{e.at.toISOString().slice(0, 16).replace("T", " ")}</span>
              <span className="text-zinc-200 w-32 shrink-0">{e.type}</span>
              <span className="text-zinc-400 truncate">{e.payload ? JSON.stringify(e.payload) : ""}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
