#!/usr/bin/env python3
"""Deterministic regime classification (STRATEGY_v2 §1) — IB-5.

Input: QQQ daily bars JSON, either the raw MCP get_equity_historicals
response or a simple list of {"date": "...", "close": float}.
Requires >= 252 + 20 bars for a full vol percentile (degrades with warning).

Usage: python3 tools/regime.py --bars qqq_bars.json [--prev-regime BULL_QUIET]
Output: JSON {trend, vol, regime, numbers..., posture}
"""
import json, math, sys, argparse

POSTURE = {  # mirror of STRATEGY_v2 §2 (authoritative source: the doc)
    "BULL_QUIET":    {"core_pct": 40, "max_satellites": 3, "risk_pct": 1.5, "heat_cap": 4.5, "min_cash": 10, "entries_week": 4, "playbooks": ["TF", "BO", "PB"], "atr_mult": 2.0},
    "BULL_VOLATILE": {"core_pct": 25, "max_satellites": 2, "risk_pct": 1.0, "heat_cap": 2.0, "min_cash": 25, "entries_week": 2, "playbooks": ["PB"], "atr_mult": 2.5},
    "RANGE":         {"core_pct": 20, "max_satellites": 2, "risk_pct": 1.0, "heat_cap": 2.0, "min_cash": 35, "entries_week": 2, "playbooks": ["MR"], "atr_mult": 1.5},
    "BEAR_QUIET":    {"core_pct": 0,  "max_satellites": 1, "risk_pct": 0.75, "heat_cap": 0.75, "min_cash": 70, "entries_week": 1, "playbooks": ["PB_A_PLUS"], "atr_mult": 2.0},
    "BEAR_CRISIS":   {"core_pct": 0,  "max_satellites": 0, "risk_pct": 0.0, "heat_cap": 0.0, "min_cash": 95, "entries_week": 0, "playbooks": [], "atr_mult": 0.0},
}


def load_closes(path):
    with open(path) as f:
        data = json.load(f)
    if isinstance(data, dict) and "data" in data:  # raw MCP shape
        bars = data["data"]["results"][0]["bars"]
        return [(b["begins_at"][:10], float(b["close_price"])) for b in bars]
    return [(b["date"], float(b["close"])) for b in data]


def sma(vals, n, offset=0):
    s = vals[len(vals) - n - offset: len(vals) - offset]
    return sum(s) / n if len(s) == n else None


def classify(closes, prev=None):
    vals = [c for _, c in closes]
    n = len(vals)
    if n < 220:
        return {"error": f"need >=220 bars, got {n}"}
    last = vals[-1]
    sma200 = sma(vals, 200)
    sma50_now = sma(vals, 50)
    sma50_back = sma(vals, 50, offset=20)
    slope_up = sma50_now > sma50_back
    if last > sma200 and slope_up:
        trend = "BULL"
    elif last < sma200 and not slope_up:
        trend = "BEAR"
    else:
        trend = "SIDEWAYS"
    # 20d realized vol (annualized stdev of log returns), percentile vs trailing year
    rets = [math.log(vals[i] / vals[i - 1]) for i in range(1, n)]
    def rv20(end):  # end = index into rets (exclusive)
        w = rets[end - 20:end]
        m = sum(w) / 20
        return math.sqrt(sum((x - m) ** 2 for x in w) / 19) * math.sqrt(252)
    rv_series = [rv20(e) for e in range(20, len(rets) + 1)]
    rv_now = rv_series[-1]
    hist = rv_series[-252:]
    less = sum(1 for x in hist if x < rv_now)
    equal = sum(1 for x in hist if x == rv_now)
    pct = (less + 0.5 * equal) / len(hist) * 100  # midrank (tie-robust)
    vol = "HIGH" if pct > 75 else ("LOW" if pct < 25 else "NORMAL")
    warn = None if len(hist) >= 200 else f"vol percentile on only {len(hist)} obs"
    if trend == "BULL":
        regime = "BULL_VOLATILE" if vol == "HIGH" else "BULL_QUIET"
    elif trend == "BEAR":
        regime = "BEAR_CRISIS" if vol == "HIGH" else "BEAR_QUIET"
    else:
        regime = "RANGE"
    return {
        "as_of": closes[-1][0], "close": round(last, 2),
        "sma200": round(sma200, 2), "sma50": round(sma50_now, 2),
        "sma50_20ago": round(sma50_back, 2), "sma50_rising": slope_up,
        "rv20_annualized": round(rv_now, 4), "rv_percentile": round(pct, 1),
        "trend": trend, "vol": vol, "regime": regime,
        "prev_regime": prev, "changed": prev is not None and prev != regime,
        "hysteresis_note": "act only after 3 consecutive closes confirm a change",
        "posture": POSTURE[regime], "warning": warn,
    }


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--bars", required=True)
    p.add_argument("--prev-regime", default=None)
    a = p.parse_args()
    print(json.dumps(classify(load_closes(a.bars), a.prev_regime), indent=2))
