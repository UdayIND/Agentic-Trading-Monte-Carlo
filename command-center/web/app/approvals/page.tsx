import { db } from "@/lib/db";
import { pendingApprovals, unackedCriticalEvents } from "@/lib/queries";
import { ApprovalActions } from "@/components/ApprovalActions";
import { num, usd } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const [pending, halts] = await Promise.all([pendingApprovals(), unackedCriticalEvents()]);

  // pull the order-path artifacts for each pending trade's run
  const enriched = await Promise.all(pending.map(async (t) => {
    const arts = t.planRunId
      ? await db.artifact.findMany({ where: { runId: t.planRunId, kind: { in: ["BULL", "BEAR", "RISK", "QUALITY", "TRADE_PLAN"] } } })
      : [];
    return { trade: t, arts };
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Approvals <span className="text-zinc-500 text-sm">({pending.length})</span></h1>

      {halts.length > 0 && (
        <div className="border border-red-700 bg-red-950/40 rounded p-3 text-sm text-red-300">
          ⚠ Trading halted — {halts.map((h) => h.kind).join(", ")}. Approvals are blocked until acknowledged.
        </div>
      )}

      {pending.length === 0 && (
        <div className="text-zinc-500 text-sm border border-zinc-800 rounded-lg p-6 text-center">
          Nothing pending. The most common and correct state — the system recommends action only when evidence clears the bar.
        </div>
      )}

      {enriched.map(({ trade: t, arts }) => {
        const get = (k: string) => arts.find((a) => a.kind === k)?.content ?? "_(not provided)_";
        return (
          <div key={t.id} className="border border-zinc-700 rounded-lg p-4 bg-zinc-950">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-base">{t.ticker}</span>
                <span className="text-xs text-zinc-400">{t.playbook}</span>
                <span className="mono text-xs">R {num(t.expectedR)}:1 · risk {usd(t.riskUsd)} · {t.shares} sh</span>
              </div>
              <a href={`/trade/${t.id}`} className="text-xs underline text-zinc-400">full detail →</a>
            </div>

            <div className="grid md:grid-cols-2 gap-3 mt-3">
              <div className="border border-zinc-800 rounded p-2">
                <div className="text-[10px] text-emerald-500 mb-1">BULL CASE</div>
                <pre className="text-xs whitespace-pre-wrap text-zinc-300 max-h-40 overflow-auto">{get("BULL")}</pre>
              </div>
              <div className="border border-zinc-800 rounded p-2">
                <div className="text-[10px] text-red-500 mb-1">BEAR CASE (fresh-context)</div>
                <pre className="text-xs whitespace-pre-wrap text-zinc-300 max-h-40 overflow-auto">{get("BEAR")}</pre>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3 mt-2">
              <div className="border border-zinc-800 rounded p-2">
                <div className="text-[10px] text-zinc-500 mb-1">RISK</div>
                <pre className="text-xs whitespace-pre-wrap text-zinc-300 max-h-32 overflow-auto">{get("RISK")}</pre>
              </div>
              <div className="border border-zinc-800 rounded p-2">
                <div className="text-[10px] text-zinc-500 mb-1">QUALITY CHECK</div>
                <pre className="text-xs whitespace-pre-wrap text-zinc-300 max-h-32 overflow-auto">{get("QUALITY")}</pre>
              </div>
            </div>

            <div className="mono text-xs text-zinc-400 mt-2">
              PLAN: entry {usd(t.entryPlan)} · stop {usd(t.stop)} · T1 {usd(t.target1)}{t.target2 ? ` · T2 ${usd(t.target2)}` : ""} · max loss {usd(t.maxLossUsd)} · hold ~{t.holdingPeriodDays}d
            </div>

            {halts.length === 0 ? <ApprovalActions tradeId={t.id} />
              : <div className="mt-3 text-xs text-red-400">Approval disabled while halted.</div>}
          </div>
        );
      })}
    </div>
  );
}
