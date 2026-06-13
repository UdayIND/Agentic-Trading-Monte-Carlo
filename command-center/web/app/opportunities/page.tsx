import { db } from "@/lib/db";
import { BandChip } from "@/components/ui";
import { num, usd } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage() {
  const latestRun = await db.run.findFirst({
    where: { opportunities: { some: {} } },
    orderBy: { date: "desc" },
    include: { opportunities: { orderBy: [{ band: "desc" }, { convictionPre: "desc" }] } },
  });

  if (!latestRun) return <div className="text-zinc-500 text-sm">No opportunity scans ingested yet.</div>;
  const opps = latestRun.opportunities;

  return (
    <div className="space-y-3">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Opportunities</h1>
        <span className="text-xs mono text-zinc-500">{latestRun.date.toISOString().slice(0, 10)} · {opps.length} scored · {latestRun.regime}</span>
      </header>

      <table className="term">
        <thead><tr>
          <th>Ticker</th><th>Conv</th><th>Band</th><th>Playbook</th><th>Sector</th>
          <th>Exp R</th><th>Target</th><th>Stop</th><th>Catalyst</th><th>Status</th>
        </tr></thead>
        <tbody>
          {opps.map((o) => (
            <tr key={o.id}>
              <td className="font-semibold">{o.ticker}</td>
              <td className="mono">{o.convictionPre}{o.convictionPost != null && o.convictionPost !== o.convictionPre ? `→${o.convictionPost}` : ""}</td>
              <td><BandChip band={o.band} /></td>
              <td>{o.playbook}</td>
              <td className="text-zinc-400">{o.sector}</td>
              <td className="mono">{o.expectedR != null ? num(o.expectedR) : "—"}</td>
              <td className="mono">{o.target != null ? usd(o.target) : "—"}</td>
              <td className="mono">{o.stop != null ? usd(o.stop) : "—"}</td>
              <td className="text-zinc-400 text-xs">{o.catalyst ?? "—"}</td>
              <td className="text-xs">{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-2">
        {opps.map((o) => (
          <details key={o.id} className="border border-zinc-800 rounded p-2">
            <summary className="text-sm cursor-pointer">{o.ticker} — {o.convictionPre} ({o.band})</summary>
            <div className="text-xs mt-2 grid md:grid-cols-2 gap-2">
              <div><span className="text-emerald-500">Inclusion: </span><span className="text-zinc-300">{o.inclusionReasons}</span></div>
              <div><span className="text-red-500">Exclusion / what's wrong: </span><span className="text-zinc-300">{o.exclusionReasons}</span></div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
