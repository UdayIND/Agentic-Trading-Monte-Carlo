import { openPositions, latestEquity } from "@/lib/queries";
import { Money } from "@/components/ui";
import { usd, pct } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const [positions, equity] = await Promise.all([openPositions(), latestEquity()]);

  return (
    <div className="space-y-3">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Portfolio</h1>
        <span className="text-xs mono text-zinc-500">{equity ? `${usd(equity.equity)} · cash ${pct(equity.cash / equity.equity, 0)} · heat ${equity.heatPct.toFixed(1)}%` : "no data"}</span>
      </header>

      {positions.length === 0 && (
        <div className="text-zinc-500 text-sm border border-zinc-800 rounded-lg p-6 text-center">
          Flat. Holding cash is a position — and the default one when conviction is insufficient.
        </div>
      )}

      {positions.length > 0 && (
        <table className="term">
          <thead><tr>
            <th>Ticker</th><th>Shares</th><th>Cost</th><th>Price</th><th>P&L</th><th>Stop</th><th>Target</th><th>Conv</th>
          </tr></thead>
          <tbody>
            {positions.map((p) => (
              <tr key={p.id}>
                <td className="font-semibold">{p.ticker}</td>
                <td className="mono">{p.shares}</td>
                <td className="mono">{usd(p.costBasis)}</td>
                <td className="mono">{usd(p.price)}</td>
                <td><Money v={p.plUsd} /></td>
                <td className="mono">{p.stop != null ? usd(p.stop) : <span className="text-red-400">MISSING</span>}</td>
                <td className="mono">{p.target != null ? usd(p.target) : "—"}</td>
                <td className="mono">{p.conviction ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {positions.map((p) => (
        <div key={p.id} className="border border-zinc-800 rounded p-2">
          <div className="text-xs text-zinc-500">Why we still own {p.ticker}</div>
          <div className="text-sm text-zinc-200">{p.whyWeStillOwnThis}</div>
        </div>
      ))}
    </div>
  );
}
