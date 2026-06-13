import { runForDate } from "@/lib/queries";
import { notFound } from "next/navigation";
import { DecisionChip } from "@/components/ui";

export const dynamic = "force-dynamic";
const ORDER = ["INTEL_REPORT", "TOP_OPPS", "BULL", "BEAR", "RISK", "TRADE_PLAN", "QUALITY", "DECISION", "POST_MORTEM", "HANDOFF", "OTHER"];

export default async function AuditDate({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const run = await runForDate(date);
  if (!run) notFound();
  const arts = [...run.artifacts].sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind));

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-lg font-semibold">Audit · {date}</h1>
        <span className="mono text-xs text-zinc-500">{run.modelVersion} · phase {run.phase} · {run.regime} · {run.gitCommit?.slice(0, 7) ?? "no commit"}</span>
      </header>

      {run.decision && (
        <div className="border border-zinc-700 rounded-lg p-3 bg-zinc-900/50">
          <div className="flex items-center gap-2"><DecisionChip d={run.decision.decision} /><span className="mono text-sm">{run.decision.confidence}%</span></div>
          <div className="text-sm text-zinc-300 mt-2">{run.decision.reasoning}</div>
          <div className="text-xs text-zinc-500 mt-1">Risks: {run.decision.risks}</div>
          <div className="text-xs text-zinc-500">Invalidation: {run.decision.invalidation}</div>
          <div className="text-xs text-zinc-500">Horizon: {run.decision.horizon}</div>
        </div>
      )}

      {run.agentRuns.length > 0 && (
        <div className="border border-zinc-800 rounded-lg p-3">
          <div className="text-xs text-zinc-500 mb-2">AGENT PASSES</div>
          <div className="space-y-1">
            {run.agentRuns.map((a) => (
              <div key={a.id} className="text-xs mono flex gap-3">
                <span className="w-28 text-zinc-300">{a.role}</span>
                <span className="w-16 text-zinc-500">{a.pass}</span>
                <span className="w-24">{a.verdict ?? ""}</span>
                <span className="text-zinc-500">{a.confidence != null ? `${a.confidence}%` : ""} {a.criticMode ?? ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {arts.map((a) => (
        <div key={a.id} className="border border-zinc-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-zinc-400">{a.kind} <span className="text-zinc-600">· {a.path}</span></div>
            <div className="text-[10px] mono text-zinc-600">sha {a.sha256.slice(0, 12)}</div>
          </div>
          <pre className="text-xs whitespace-pre-wrap text-zinc-300 max-h-72 overflow-auto">{a.content}</pre>
          {a.evidence.length > 0 && (
            <div className="mt-2 text-[11px] text-zinc-500">
              {a.evidence.map((e) => <div key={e.id}>• {e.claim} <span className="text-zinc-600">[{e.sourceName} T{e.sourceTier} {e.confidence}]</span></div>)}
            </div>
          )}
        </div>
      ))}
      <div className="text-[11px] text-zinc-600 print:hidden">Tip: print this page to export the full decision record.</div>
    </div>
  );
}
