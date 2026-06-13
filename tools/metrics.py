#!/usr/bin/env python3
"""Deterministic metric pack (IB-3/IB-6): TWR returns, flow-adjusted HWM/DD,
Sharpe/Sortino/PF/expectancy vs PERFORMANCE_EVALUATION thresholds.

Inputs:
  state/equity_curve.csv  date,equity,cash,heat_pct,regime
  state/flows.csv         date,amount,type,note   (+deposit / -withdrawal)
  trades JSON (optional)  [{"realized_r": float, "realized_usd": float}, ...]

Usage: python3 tools/metrics.py [--curve ...] [--flows ...] [--trades t.json]
       [--rf 0.04] [--qqq qqq.json]
"""
import json, csv, math, argparse, os

BASE = os.path.join(os.path.dirname(__file__), "..")


def read_csv(path):
    with open(path) as f:
        return list(csv.DictReader(f))


def compute(curve_rows, flow_rows, trades, rf=0.04):
    out = {"insufficient": [], "thresholds": {}}
    flows = {}
    for r in flow_rows:
        flows[r["date"]] = flows.get(r["date"], 0.0) + float(r["amount"])
    pts = [(r["date"], float(r["equity"]), float(r["cash"])) for r in curve_rows if r.get("equity")]
    out["days"] = len(pts)
    if len(pts) >= 2:
        # time-weighted daily returns: r_t = (E_t - F_t) / E_{t-1} - 1
        rets, hwm_idx, dd_max, idx = [], 1.0, 0.0, 1.0
        idx_series = []
        for i in range(1, len(pts)):
            prev_e = pts[i - 1][1]
            f = flows.get(pts[i][0], 0.0)
            if prev_e <= 0:
                continue
            r = (pts[i][1] - f) / prev_e - 1
            rets.append(r)
            idx *= (1 + r)
            idx_series.append(idx)
            hwm_idx = max(hwm_idx, idx)
            dd_max = max(dd_max, 1 - idx / hwm_idx)
        out["twr_total"] = round(idx - 1, 6)
        out["max_drawdown"] = round(dd_max, 6)
        out["current_drawdown"] = round(1 - idx / hwm_idx, 6) if hwm_idx else 0
        years = len(rets) / 252
        out["cagr"] = round(idx ** (1 / years) - 1, 6) if years > 0 and idx > 0 else None
        if len(rets) >= 60:
            mu = sum(rets) / len(rets)
            var = sum((x - mu) ** 2 for x in rets) / (len(rets) - 1)
            sd = math.sqrt(var)
            daily_rf = rf / 252
            out["sharpe"] = round((mu - daily_rf) / sd * math.sqrt(252), 4) if sd else None
            downs = [min(0, x - daily_rf) for x in rets]
            dsd = math.sqrt(sum(d * d for d in downs) / (len(rets) - 1))
            out["sortino"] = round((mu - daily_rf) / dsd * math.sqrt(252), 4) if dsd else None
        else:
            out["insufficient"].append(f"sharpe/sortino need >=60 daily obs (have {len(rets)})")
        exposures = [1 - (c / e) for _, e, c in pts if e > 0]
        out["avg_exposure"] = round(sum(exposures) / len(exposures), 4) if exposures else None
    else:
        out["insufficient"].append("equity curve has <2 points")
    n = len(trades)
    out["closed_trades"] = n
    if n >= 1:
        wins = [t for t in trades if float(t["realized_r"]) > 0]
        losses = [t for t in trades if float(t["realized_r"]) <= 0]
        out["win_rate"] = round(len(wins) / n, 4)
        gw = sum(float(t.get("realized_usd", t["realized_r"])) for t in wins)
        gl = abs(sum(float(t.get("realized_usd", t["realized_r"])) for t in losses))
        out["profit_factor"] = round(gw / gl, 4) if gl else None
        out["expectancy_r"] = round(sum(float(t["realized_r"]) for t in trades) / n, 4)
        out["avg_win_r"] = round(sum(float(t["realized_r"]) for t in wins) / len(wins), 4) if wins else None
        out["avg_loss_r"] = round(sum(float(t["realized_r"]) for t in losses) / len(losses), 4) if losses else None
    if n < 20:
        out["insufficient"].append(f"trade metrics not actionable until n>=20 (have {n})")
    # thresholds (PERFORMANCE_EVALUATION §1) — evaluated only when measurable
    th = out["thresholds"]
    def gate(name, val, ok_min):
        th[name] = {"value": val, "min": ok_min,
                    "status": None if val is None else ("pass" if val >= ok_min else "BREACH")}
    gate("sharpe", out.get("sharpe"), 0.5)
    gate("sortino", out.get("sortino"), 0.8)
    gate("win_rate", out.get("win_rate") if n >= 20 else None, 0.35)
    gate("expectancy_r", out.get("expectancy_r") if n >= 20 else None, 0.10)
    gate("profit_factor", out.get("profit_factor") if n >= 20 else None, 1.2)
    mdd = out.get("max_drawdown")
    th["max_drawdown"] = {"value": mdd, "max": 0.15,
                          "status": None if mdd is None else ("pass" if mdd <= 0.15 else "BREACH")}
    return out


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--curve", default=os.path.join(BASE, "state", "equity_curve.csv"))
    p.add_argument("--flows", default=os.path.join(BASE, "state", "flows.csv"))
    p.add_argument("--trades", default=None)
    p.add_argument("--rf", type=float, default=0.04)
    a = p.parse_args()
    trades = json.load(open(a.trades)) if a.trades else []
    flow_rows = read_csv(a.flows) if os.path.exists(a.flows) else []
    print(json.dumps(compute(read_csv(a.curve), flow_rows, trades, a.rf), indent=2))
