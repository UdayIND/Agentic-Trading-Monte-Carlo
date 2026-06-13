import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function MarketPage() {
  const report = await db.artifact.findFirst({
    where: { kind: "INTEL_REPORT" },
    include: { evidence: true, run: true },
    orderBy: { createdAt: "desc" },
  });

  if (!report) return <div className="text-zinc-500 text-sm">No intelligence report ingested yet.</div>;

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Market Intelligence</h1>
        <span className="text-xs mono text-zinc-500">{report.run.date.toISOString().slice(0, 10)} · {report.run.regime}</span>
      </header>

      <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-950">
        <pre className="text-xs whitespace-pre-wrap text-zinc-300 leading-relaxed">{report.content}</pre>
      </div>

      <div className="border border-zinc-800 rounded-lg p-3">
        <div className="text-xs text-zinc-500 mb-2">EVIDENCE ({report.evidence.length})</div>
        {report.evidence.length === 0 && <div className="text-xs text-zinc-600">No structured evidence blocks attached.</div>}
        <div className="space-y-2">
          {report.evidence.map((e) => (
            <div key={e.id} className="text-xs border-l-2 border-zinc-700 pl-2">
              <div className="text-zinc-200">{e.claim}</div>
              <div className="text-zinc-500 mono">
                {e.sourceName} · T{e.sourceTier} · {e.confidence}
                {e.publishedAt ? ` · ${e.publishedAt.toISOString().slice(0, 10)}` : ""}
                {e.url ? ` · ${e.url}` : ""}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
