import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ImprovementPage() {
  const [blocks, cal, qualityBlocks] = await Promise.all([
    db.qualityBlockEvent.findMany({ orderBy: { date: "desc" }, take: 50 }),
    db.calibrationClaim.findMany({ where: { outcome: { not: null } } }),
    db.qualityBlockEvent.groupBy({ by: ["check"], _count: true }),
  ]);
  const resolved = cal.length;
  const hits = cal.filter((c) => c.outcome).length;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">AI Improvement Center</h1>

      <div className="grid md:grid-cols-3 gap-3">
        <div className="border border-zinc-800 rounded-lg p-3">
          <div className="text-xs text-zinc-500">PREDICTION ACCURACY</div>
          <div className="mono text-lg mt-1">{resolved > 0 ? `${((hits / resolved) * 100).toFixed(0)}%` : "—"}</div>
          <div className="text-[10px] text-zinc-500">{resolved} resolved confidence claims</div>
        </div>
        <div className="border border-zinc-800 rounded-lg p-3">
          <div className="text-xs text-zinc-500">QUALITY BLOCKS</div>
          <div className="mono text-lg mt-1">{blocks.length}</div>
          <div className="text-[10px] text-zinc-500">recommendations stopped before harm</div>
        </div>
        <div className="border border-zinc-800 rounded-lg p-3">
          <div className="text-xs text-zinc-500">CALIBRATION SAMPLE</div>
          <div className="mono text-lg mt-1">{resolved}</div>
          <div className="text-[10px] text-zinc-500">grows as claims resolve</div>
        </div>
      </div>

      <div className="border border-zinc-800 rounded-lg p-3">
        <div className="text-xs text-zinc-500 mb-2">QUALITY-BLOCK TELEMETRY (by check #)</div>
        {qualityBlocks.length === 0 && <div className="text-xs text-zinc-600">No blocks recorded — gate has not had to fire yet.</div>}
        {qualityBlocks.map((q) => (
          <div key={q.check} className="text-xs mono">check #{q.check}: {q._count} block(s)</div>
        ))}
      </div>

      <div className="text-[11px] text-zinc-600">
        Improvement backlog is maintained as a file (journal/IMPROVEMENT_BACKLOG.md) and ingested here as it matures. Missed-opportunity and false-positive accounting populate once trades resolve.
      </div>
    </div>
  );
}
