import Link from "next/link";
import { recentRuns } from "@/lib/queries";
import { DecisionChip } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AuditIndex() {
  const runs = await recentRuns(60);
  return (
    <div className="space-y-3">
      <h1 className="text-lg font-semibold">Decision Audit</h1>
      <p className="text-xs text-zinc-500">Every run is reconstructable from its artifacts, evidence, and agent passes. Pick a date.</p>
      <table className="term">
        <thead><tr><th>Date</th><th>Type</th><th>Status</th><th>Regime</th><th>Decision</th><th>Commit</th><th></th></tr></thead>
        <tbody>
          {runs.map((r) => (
            <tr key={r.id}>
              <td className="mono">{r.date.toISOString().slice(0, 10)}</td>
              <td>{r.type}</td>
              <td>{r.status}</td>
              <td className="text-zinc-400">{r.regime}</td>
              <td>{r.decision ? <DecisionChip d={r.decision.decision} /> : "—"}</td>
              <td className="mono text-zinc-500">{r.gitCommit?.slice(0, 7) ?? "—"}</td>
              <td><Link href={`/audit/${r.date.toISOString().slice(0, 10)}`} className="underline text-xs">open</Link></td>
            </tr>
          ))}
          {runs.length === 0 && <tr><td colSpan={7} className="text-zinc-600">No runs ingested yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
