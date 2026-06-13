// Minimal dependency-free SVG line chart (system equity vs QQQ baseline).
export function EquityChart({ points }: { points: { date: string; equity: number; qqq: number | null }[] }) {
  if (points.length < 2) return <div className="text-xs text-zinc-600 p-4">Need ≥2 equity points to chart.</div>;
  const W = 640, H = 200, pad = 30;
  const eq = points.map((p) => p.equity);
  const qqqVals = points.map((p) => p.qqq).filter((x): x is number => x != null);
  const all = [...eq, ...qqqVals];
  const min = Math.min(...all), max = Math.max(...all), range = max - min || 1;
  const x = (i: number) => pad + (i / (points.length - 1)) * (W - 2 * pad);
  const y = (v: number) => H - pad - ((v - min) / range) * (H - 2 * pad);
  const line = (sel: (p: typeof points[number]) => number | null) =>
    points.map((p, i) => { const v = sel(p); return v == null ? null : `${x(i)},${y(v)}`; })
      .filter(Boolean).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <polyline points={line((p) => p.equity)} fill="none" stroke="#34d399" strokeWidth="1.5" />
      {qqqVals.length > 1 && <polyline points={line((p) => p.qqq)} fill="none" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3 3" />}
      <text x={pad} y={12} fontSize="9" fill="#34d399">system</text>
      <text x={pad + 50} y={12} fontSize="9" fill="#60a5fa">qqq</text>
    </svg>
  );
}
