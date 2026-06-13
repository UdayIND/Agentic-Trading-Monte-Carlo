// Deterministic performance metrics — computed in TypeScript from rows,
// NEVER ingested from LLM prose (the platform mirror of tools/metrics.py).
// Golden-file tested in CI. Mirrors the TWR / flow-adjusted methodology.

export interface EquityRow { date: string; equity: number; cash: number }
export interface FlowRow { date: string; amount: number }
export interface ClosedTrade { realizedR: number; realizedUsd: number }

export interface MetricPack {
  days: number;
  twrTotal: number | null;
  cagr: number | null;
  maxDrawdown: number | null;
  currentDrawdown: number | null;
  sharpe: number | null;
  sortino: number | null;
  avgExposure: number | null;
  closedTrades: number;
  winRate: number | null;
  profitFactor: number | null;
  expectancyR: number | null;
  insufficient: string[];
}

export function computeMetrics(
  curve: EquityRow[], flows: FlowRow[], trades: ClosedTrade[], rf = 0.04,
): MetricPack {
  const insufficient: string[] = [];
  const flowByDate = new Map<string, number>();
  for (const f of flows) flowByDate.set(f.date, (flowByDate.get(f.date) ?? 0) + f.amount);

  const pts = curve.filter((r) => Number.isFinite(r.equity));
  let twrTotal: number | null = null, cagr: number | null = null;
  let maxDrawdown: number | null = null, currentDrawdown: number | null = null;
  let sharpe: number | null = null, sortino: number | null = null, avgExposure: number | null = null;

  if (pts.length >= 2) {
    const rets: number[] = [];
    let idx = 1, hwm = 1, ddMax = 0;
    for (let i = 1; i < pts.length; i++) {
      const prevE = pts[i - 1].equity;
      if (prevE <= 0) continue;
      const f = flowByDate.get(pts[i].date) ?? 0;
      const r = (pts[i].equity - f) / prevE - 1;
      rets.push(r);
      idx *= 1 + r;
      hwm = Math.max(hwm, idx);
      ddMax = Math.max(ddMax, 1 - idx / hwm);
    }
    twrTotal = idx - 1;
    maxDrawdown = ddMax;
    currentDrawdown = hwm ? 1 - idx / hwm : 0;
    const years = rets.length / 252;
    cagr = years > 0 && idx > 0 ? idx ** (1 / years) - 1 : null;
    if (rets.length >= 60) {
      const mu = rets.reduce((a, b) => a + b, 0) / rets.length;
      const variance = rets.reduce((a, b) => a + (b - mu) ** 2, 0) / (rets.length - 1);
      const sd = Math.sqrt(variance);
      const dailyRf = rf / 252;
      sharpe = sd ? ((mu - dailyRf) / sd) * Math.sqrt(252) : null;
      const downs = rets.map((x) => Math.min(0, x - dailyRf));
      const dsd = Math.sqrt(downs.reduce((a, d) => a + d * d, 0) / (rets.length - 1));
      sortino = dsd ? ((mu - dailyRf) / dsd) * Math.sqrt(252) : null;
    } else {
      insufficient.push(`sharpe/sortino need >=60 daily obs (have ${rets.length})`);
    }
    const exps = pts.filter((p) => p.equity > 0).map((p) => 1 - p.cash / p.equity);
    avgExposure = exps.length ? exps.reduce((a, b) => a + b, 0) / exps.length : null;
  } else {
    insufficient.push("equity curve has <2 points");
  }

  const n = trades.length;
  let winRate: number | null = null, profitFactor: number | null = null, expectancyR: number | null = null;
  if (n >= 1) {
    const wins = trades.filter((t) => t.realizedR > 0);
    const losses = trades.filter((t) => t.realizedR <= 0);
    winRate = wins.length / n;
    const gw = wins.reduce((a, t) => a + t.realizedUsd, 0);
    const gl = Math.abs(losses.reduce((a, t) => a + t.realizedUsd, 0));
    profitFactor = gl ? gw / gl : null;
    expectancyR = trades.reduce((a, t) => a + t.realizedR, 0) / n;
  }
  if (n < 20) insufficient.push(`trade metrics not actionable until n>=20 (have ${n})`);

  return { days: pts.length, twrTotal, cagr, maxDrawdown, currentDrawdown,
    sharpe, sortino, avgExposure, closedTrades: n, winRate, profitFactor, expectancyR, insufficient };
}
