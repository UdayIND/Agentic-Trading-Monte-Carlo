import { DECISION_STYLE, BAND_STYLE, signClass } from "@/lib/format";

export function DecisionChip({ d }: { d: string }) {
  return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${DECISION_STYLE[d] ?? "bg-zinc-700"}`}>{d.replace("_", " ")}</span>;
}

export function BandChip({ band }: { band: string }) {
  return <span className={`text-xs font-medium ${BAND_STYLE[band] ?? ""}`}>{band}</span>;
}

export function ConfidenceChip({ pct, calibration }: { pct: number; calibration?: number | null }) {
  // calibration-aware: show discounted reading when a role is over-confident
  const discounted = calibration != null && calibration < 0.6 ? Math.round(pct * 0.8) : null;
  return (
    <span className="mono text-xs">
      {pct}%{discounted != null && <span className="text-amber-500"> (~{discounted}% cal)</span>}
    </span>
  );
}

export function StalenessBadge({ asOf, freshMinutes = 15 }: { asOf: string | Date; freshMinutes?: number }) {
  const ageMin = (Date.now() - new Date(asOf).getTime()) / 60000;
  const stale = ageMin > freshMinutes;
  return (
    <span className={`text-[10px] mono ${stale ? "text-amber-500" : "text-zinc-500"}`}>
      {stale ? "⚠ " : ""}{new Date(asOf).toISOString().slice(0, 16).replace("T", " ")}Z
    </span>
  );
}

export function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="border border-zinc-800 rounded-lg p-3 bg-zinc-950">
      {title && <div className="text-xs text-zinc-500 mb-1">{title}</div>}
      {children}
    </div>
  );
}

export function ThresholdMetric({ label, value, threshold, ok }: { label: string; value: string; threshold: string; ok: boolean | null }) {
  const chip = ok == null ? "text-zinc-500" : ok ? "text-emerald-400" : "text-red-400";
  return (
    <div className="flex justify-between items-baseline border-b border-zinc-900 py-1">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className="mono text-sm">
        {value} <span className={`text-xs ${chip}`}>({ok == null ? "n/a" : ok ? "pass" : "BREACH"} {threshold})</span>
      </span>
    </div>
  );
}

export function PaperWatermark() {
  if (process.env.NEXT_PUBLIC_PHASE === "live") return null;
  return <span className="px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-400 text-[10px] font-bold tracking-wider">PAPER</span>;
}

export function Money({ v }: { v: number | null | undefined }) {
  return <span className={`mono ${signClass(v)}`}>{v == null ? "—" : `$${v.toFixed(2)}`}</span>;
}
