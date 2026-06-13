// Display helpers. Numbers monospaced upstream; these handle null/sign/color.

export const PAPER = process.env.NEXT_PUBLIC_PHASE !== "live";

export function pct(v: number | null | undefined, digits = 1): string {
  return v == null ? "—" : `${(v * 100).toFixed(digits)}%`;
}
export function usd(v: number | null | undefined): string {
  return v == null ? "—" : `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
export function num(v: number | null | undefined, digits = 2): string {
  return v == null ? "—" : v.toFixed(digits);
}
export function signClass(v: number | null | undefined): string {
  if (v == null || v === 0) return "text-zinc-400";
  return v > 0 ? "text-emerald-400" : "text-red-400";
}
export const DECISION_STYLE: Record<string, string> = {
  BUY: "bg-emerald-600 text-white",
  SELL: "bg-red-600 text-white",
  HOLD: "bg-blue-600 text-white",
  DO_NOTHING: "bg-zinc-600 text-zinc-100",
};
export const BAND_STYLE: Record<string, string> = {
  HIGH: "text-amber-300", TRADABLE: "text-emerald-400",
  WATCH: "text-amber-500", REJECT: "text-zinc-500",
};
